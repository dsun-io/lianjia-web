/**
 * 联佳外贸官网 — Google Apps Script 表单邮件转发
 * =============================================
 * 零成本方案：用 Google Apps Script 接收表单，通过你的 Gmail 发到你的邮箱。
 * 
 * 部署步骤：
 * 1. 打开 https://script.google.com
 * 2. 新建项目，粘贴本文件全部内容
 * 3. 修改下方 YOUR_EMAIL 为你的邮箱
 * 4. 点击「部署」→「新部署」→ 类型选「Web 应用」
 *    → 执行身份：自己 / 访问权限：所有人
 * 5. 复制生成的 URL，替换网站中所有 FORM_SCRIPT_URL
 */

// ====== 配置 ======
var YOUR_EMAIL = '[YOUR_EMAIL@gmail.com]'; // 替换为你的邮箱

// ====== 主函数 ======
function doPost(e) {
  try {
    var data = e.parameter;

    // 构造邮件正文
    var body = '';
    body += '══════ 新询盘 ══════\n\n';

    if (data.name)       body += '姓名: ' + data.name + '\n';
    if (data.email)      body += '邮箱: ' + data.email + '\n';
    if (data.company)    body += '公司: ' + data.company + '\n';
    if (data.country)    body += '国家: ' + data.country + '\n';
    if (data.product)    body += '意向产品: ' + data.product + '\n';
    if (data.scenario)   body += '项目描述: ' + data.scenario + '\n';
    if (data.fence_length) body += '围栏长度: ' + data.fence_length + '\n';
    if (data.needs_posts)  body += '需要立柱/配件: ' + data.needs_posts + '\n';
    if (data.message)    body += '补充信息: ' + data.message + '\n';
    if (data.source_page) body += '来源页: ' + data.source_page + '\n';
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

    // 发送邮件
    var subject = '新询盘: ' + (data.product || '官网询盘') + ' - 来自 ' + (data.name || '未知');
    MailApp.sendEmail({
      to: YOUR_EMAIL,
      subject: subject,
      body: body
    });

    // 返回成功（CORS 友好）
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ====== 可选：处理 GET 请求（调试用） ======
function doGet() {
  return ContentService.createTextOutput('联佳外贸官网 Form API is running.');
}
