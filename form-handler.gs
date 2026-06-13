/**
 * 联佳外贸官网 — Google Apps Script 表单邮件转发（安全加固版）
 * =============================================
 * 功能：
 *   ① 蜜罐检测 — 拦截机器人垃圾提交
 *   ② 先写 Sheet 再发邮件 — 配额耗尽也不丢客户
 *   ③ 配额预警 — 剩余不足时企业微信报警
 *   ④ Cloudflare Turnstile 校验（可选，需配置 secret）
 *
 * 部署步骤：
 *   1. 打开 https://script.google.com
 *   2. 新建项目，粘贴本文件全部内容
 *   3. 修改下方配置区的常量
 *   4. 点击「运行」→「setup」→ 授权（仅首次）
 *   5. 点击「部署」→「新部署」→ 类型选「Web 应用」
 *      → 执行身份：自己 / 访问权限：所有人
 *   6. 复制生成的 URL，替换网站中所有 form action
 */

// ╔══════════════════════════════════════════════╗
// ║                   配 置 区                    ║
// ╚══════════════════════════════════════════════╝

var YOUR_EMAIL       = 'dspro0124@163.com';           // 接收询盘的邮箱
var SHEET_ID         = '1BO5WZMTCnXTg8tYY6Oi0TmiAoPlXu27Phdy0GcorU3s'; // Google Sheet ID
var TURNSTILE_SECRET = '';                            // Turnstile secret_key（留空跳过校验）
var WECHAT_WEBHOOK   = '';                            // 企业微信 webhook（留空跳过报警）
var QUOTA_THRESHOLD  = 10;                            // 邮件配额低于此值时报警

// ╔══════════════════════════════════════════════╗
// ║              首次运行：写入表头               ║
// ╚══════════════════════════════════════════════╝

/**
 * 首次部署后运行一次，写入 Sheet 表头。
 * 菜单栏选 setup → 点击运行 → 授权即可。
 */
function setup() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getActiveSheet();
  sheet.appendRow([
    '提交时间',
    '姓名',
    '邮箱',
    '公司',
    '国家',
    '意向产品',
    '项目描述',
    '围栏长度',
    '需要立柱/配件',
    '补充信息',
    '来源页',
    '浏览行为'
  ]);
  // 冻结首行 + 自动列宽
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 12);
  Logger.log('表头写入完成，Sheet 名称: ' + sheet.getName());
}

// ╔══════════════════════════════════════════════╗
// ║                  主 函 数                    ║
// ╚══════════════════════════════════════════════╝

function doPost(e) {
  try {
    var data = e.parameter;

    // ── ① 蜜罐检查：_gotcha 有值 = 机器人，静默丢弃 ──
    if (data._gotcha && data._gotcha.trim() !== '') {
      return jsonResponse(true);
    }

    // ── ② Turnstile 校验（配置了 secret 才生效） ──
    if (TURNSTILE_SECRET) {
      var token = data['cf-turnstile-response'] || '';
      if (!token || !verifyTurnstile(token)) {
        return jsonResponse(false, 'Verification failed');
      }
    }

    // ── ③ 先写 Sheet（确保数据落库） ──
    writeToSheet(data);

    // ── ④ 配额检查 + 预警 ──
    var remainingQuota = MailApp.getRemainingDailyQuota();
    if (remainingQuota < QUOTA_THRESHOLD) {
      sendQuotaAlert(remainingQuota);
    }

    // ── ⑤ 发邮件 ──
    sendEmailNotification(data);

    return jsonResponse(true);

  } catch (err) {
    // Sheet 已写入，数据不丢；邮件失败仅记录
    return jsonResponse(false, err.toString());
  }
}

// ╔══════════════════════════════════════════════╗
// ║                 写入 Sheet                   ║
// ╚══════════════════════════════════════════════╝

function writeToSheet(data) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  sheet.appendRow([
    new Date(),                        // 提交时间
    data.name         || '',           // 姓名
    data.email        || '',           // 邮箱
    data.company      || '',           // 公司
    data.country      || '',           // 国家
    data.product      || '',           // 意向产品
    data.scenario     || '',           // 项目描述
    data.fence_length || '',           // 围栏长度
    data.needs_posts  || '',           // 需要立柱/配件
    data.message      || '',           // 补充信息
    data.source_page  || '',           // 来源页
    data.dwell_times  || ''            // 浏览行为（JSON 字符串）
  ]);
}

// ╔══════════════════════════════════════════════╗
// ║                  发送邮件                    ║
// ╚══════════════════════════════════════════════╝

function sendEmailNotification(data) {
  var body = '══════ 新询盘 ══════\n\n';

  if (data.name)         body += '姓名: '     + data.name         + '\n';
  if (data.email)        body += '邮箱: '     + data.email        + '\n';
  if (data.company)      body += '公司: '     + data.company      + '\n';
  if (data.country)      body += '国家: '     + data.country      + '\n';
  if (data.product)      body += '意向产品: ' + data.product      + '\n';
  if (data.scenario)     body += '项目描述: ' + data.scenario     + '\n';
  if (data.fence_length) body += '围栏长度: ' + data.fence_length + '\n';
  if (data.needs_posts)  body += '需要立柱/配件: ' + data.needs_posts + '\n';
  if (data.message)      body += '补充信息: ' + data.message      + '\n';
  if (data.source_page)  body += '来源页: '   + data.source_page  + '\n';

  if (data.dwell_times) {
    body += '\n── 浏览行为 ──\n';
    try {
      var dwell = JSON.parse(data.dwell_times);
      for (var key in dwell) {
        body += key + ': ' + Math.round(dwell[key]) + '秒\n';
      }
    } catch (ex) {
      body += data.dwell_times + '\n';
    }
  }

  body += '\n═══════════════════\n';
  body += '提交时间: ' + new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) + '\n';

  var subject = '新询盘: ' + (data.product || '官网询盘') + ' - 来自 ' + (data.name || '未知');
  MailApp.sendEmail({ to: YOUR_EMAIL, subject: subject, body: body });
}

// ╔══════════════════════════════════════════════╗
// ║              Cloudflare Turnstile             ║
// ╚══════════════════════════════════════════════╝

function verifyTurnstile(token) {
  try {
    var resp = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'post',
      payload: { secret: TURNSTILE_SECRET, response: token }
    });
    return JSON.parse(resp.getContentText()).success === true;
  } catch (ex) {
    return false;
  }
}

// ╔══════════════════════════════════════════════╗
// ║                配额预警报警                   ║
// ╚══════════════════════════════════════════════╝

function sendQuotaAlert(remaining) {
  if (!WECHAT_WEBHOOK) return;
  try {
    UrlFetchApp.fetch(WECHAT_WEBHOOK, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        msgtype: 'text',
        text: {
          content: '⚠️ 联佳海外站询盘表单邮件配额预警\n剩余: ' + remaining + ' 封\n时间: ' +
                   new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        }
      })
    });
  } catch (ex) { /* 报警失败不影响主流程 */ }
}

// ╔══════════════════════════════════════════════╗
// ║              工具函数                        ║
// ╚══════════════════════════════════════════════╝

function jsonResponse(ok, error) {
  var payload = ok ? { ok: true } : { ok: false, error: error || 'Unknown error' };
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput('联佳外贸官网 Form API is running.');
}
