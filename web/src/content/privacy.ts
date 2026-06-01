export const privacyByLocale = {
  en: `# Privacy Policy

**LLM Wiki** · Effective date: April 26, 2026

LLM Wiki is operated by Polybius, L.L.C., a Delaware limited liability company ("Polybius," "we," "us," "our"). LLM Wiki is a free, open-source knowledge base service available at llmwiki.app. This policy explains what data we collect, how we use it, and your rights regarding that data.

## What we collect

### Account information
When you sign up, we collect your email address and display name via Supabase Auth. If you sign in with Google OAuth, we receive your name, email, and profile photo from Google. We do not store your Google password.

### Content you upload
Documents, notes, PDFs, and other files you add to your knowledge bases are stored on our infrastructure. This includes the original files, extracted text, and generated wiki pages. This is the core function of the service — we store your content so you and your connected AI tools can access it.

### Processed content
When you upload PDFs or office documents, we process them server-side to extract text. The extracted text is stored alongside the original file.

### Browser extension data
If you use the LLM Wiki Chrome extension, it captures the text content of web pages you explicitly choose to clip. The extension only activates when you click the save button — it does not passively monitor your browsing. Page content is sent directly to our API and stored in your knowledge base.

### Usage data
We collect basic usage analytics: page views, feature usage, and error logs. We do not use third-party tracking scripts or advertising pixels.

## How your content is stored

| Component | Provider | Location | Purpose |
|-----------|----------|----------|---------|
| Database | Supabase (Postgres) | AWS US regions | Account data, documents, wiki pages, metadata |
| File storage | Amazon S3 | US East | Raw uploaded files (PDFs, images) |
| API hosting | Railway | US regions | API and MCP servers |
| Frontend hosting | Netlify | Global CDN | Web application |

All data is encrypted at rest (AES-256) and in transit (TLS 1.2+). Database access is enforced through row-level security (RLS) — each user can only access their own data.

## Third-party services that process your content

| Service | What it sees | Why |
|---------|-------------|-----|
| Supabase | All stored data | Database and authentication provider |
| Amazon S3 | Raw uploaded files | File storage |
| Railway | All data in transit through API | API and MCP server hosting |
| Netlify | Frontend assets, request logs | Web application hosting |
| Anthropic (Claude) | Document content during AI conversations | Wiki generation and knowledge base tools via MCP |

We do not send your content to any service for the purpose of AI model training.

## How AI tools access your content

LLM Wiki connects to AI assistants (such as Claude by Anthropic) via the Model Context Protocol (MCP). When you connect your Claude account:

- Claude can search, read, and write to your knowledge bases using MCP tools
- Your content is sent to Claude through Anthropic's infrastructure as part of your conversations
- This access is governed by your relationship with Anthropic and their privacy policy
- You can disconnect Claude at any time by removing the MCP connector in your Claude settings

We do not control how Anthropic processes content sent through Claude conversations. Refer to Anthropic's privacy policy for details on their data handling.

## What we do NOT do

- We do not sell your data
- We do not serve advertisements
- We do not use your content to train AI models
- We do not share your content with other users (unless you explicitly make a knowledge base public)
- We do not access your content for any purpose other than providing the service, unless required by law

## Public knowledge bases

If you choose to make a knowledge base public, its wiki pages will be visible to anyone on the internet and may be indexed by search engines. Raw source documents in a public knowledge base are not made public — only wiki pages. You can make a knowledge base private again at any time, which removes it from public access.

## Data retention and deletion

Your content is stored as long as you maintain an account. You can delete individual documents, knowledge bases, or your entire account at any time.

When you delete content:
- Documents and wiki pages are removed from the database
- Uploaded files are removed from S3
- Search index entries are removed
- Deletion is permanent — we do not retain backups of deleted content beyond our standard database backup window (7 days)

When you delete your account:
- All knowledge bases, documents, wiki pages, and uploaded files are permanently deleted
- Your authentication credentials are removed from Supabase
- This process is irreversible

To request account deletion, email lucas@llmwiki.app.

## Your rights

You can at any time:
- Export your data (download your documents and wiki pages)
- Delete specific content or your entire account
- Disconnect AI tool access by removing MCP connectors
- Make knowledge bases private or public
- Request information about what data we hold (email lucas@llmwiki.app)

If you are in the EU, you have additional rights under GDPR including the right to data portability, rectification, and erasure. Contact lucas@llmwiki.app to exercise these rights.

## Self-hosting

LLM Wiki is open source (Apache 2.0). If you require full data sovereignty, you can self-host the entire stack on your own infrastructure. When self-hosted, no data passes through our systems. See the GitHub repository for deployment instructions.

## Children

LLM Wiki is not intended for use by anyone under the age of 13. We do not knowingly collect personal information from children under 13.

## Changes to this policy

We may update this policy from time to time. We will notify you of material changes by email or by posting a notice in the application. Continued use of the service after changes constitutes acceptance of the updated policy.

## Contact

For privacy questions or data requests: lucas@llmwiki.app
`,
  zh: `# 隐私政策

**LLM Wiki** · 生效日期：2026 年 4 月 26 日

LLM Wiki 由 Polybius, L.L.C. 运营，Polybius, L.L.C. 是一家 Delaware limited liability company（以下简称 “Polybius”、“我们”）。LLM Wiki 是一个免费、开源的知识库服务，网址为 llmwiki.app。本政策说明我们收集哪些数据、如何使用这些数据，以及你对这些数据享有哪些权利。

## 我们收集什么

### 账户信息
当你注册时，我们会通过 Supabase Auth 收集你的邮箱地址和显示名称。如果你使用 Google OAuth 登录，我们会从 Google 接收你的姓名、邮箱和头像。我们不会存储你的 Google 密码。

### 你上传的内容
你添加到知识库中的文档、笔记、PDF 和其他文件会存储在我们的基础设施中。这包括原始文件、提取出的文本和生成的 Wiki 页面。这是本服务的核心功能：我们存储你的内容，以便你和你连接的 AI 工具可以访问它。

### 处理后的内容
当你上传 PDF 或 Office 文档时，我们会在服务端处理它们以提取文本。提取出的文本会与原始文件一起存储。

### 浏览器扩展数据
如果你使用 LLM Wiki Chrome 扩展，它会捕获你明确选择保存的网页文本内容。扩展只会在你点击保存按钮时激活，不会被动监控你的浏览行为。页面内容会直接发送到我们的 API，并存储在你的知识库中。

### 使用数据
我们会收集基础使用分析数据：页面访问、功能使用和错误日志。我们不使用第三方跟踪脚本或广告像素。

## 你的内容如何存储

| 组件 | 服务提供方 | 位置 | 用途 |
|------|------------|------|------|
| 数据库 | Supabase (Postgres) | AWS US regions | 账户数据、文档、Wiki 页面、元数据 |
| 文件存储 | Amazon S3 | US East | 原始上传文件（PDF、图片） |
| API 托管 | Railway | US regions | API 和 MCP 服务器 |
| 前端托管 | Netlify | Global CDN | Web 应用 |

所有数据在静态存储时使用 AES-256 加密，在传输中使用 TLS 1.2+ 加密。数据库访问通过行级安全策略（RLS）执行，每个用户只能访问自己的数据。

## 会处理你内容的第三方服务

| 服务 | 可见内容 | 原因 |
|------|----------|------|
| Supabase | 所有已存储数据 | 数据库和认证提供方 |
| Amazon S3 | 原始上传文件 | 文件存储 |
| Railway | 经 API 传输的所有数据 | API 和 MCP 服务器托管 |
| Netlify | 前端资源、请求日志 | Web 应用托管 |
| Anthropic (Claude) | AI 对话期间的文档内容 | 通过 MCP 提供 Wiki 生成和知识库工具 |

我们不会为了训练 AI 模型而将你的内容发送给任何服务。

## AI 工具如何访问你的内容

LLM Wiki 通过 Model Context Protocol（MCP）连接 AI 助手，例如 Anthropic 的 Claude。当你连接 Claude 账户后：

- Claude 可以使用 MCP 工具搜索、读取和写入你的知识库
- 你的内容会作为对话的一部分，通过 Anthropic 的基础设施发送给 Claude
- 该访问受你与 Anthropic 的关系及其隐私政策约束
- 你可以随时在 Claude 设置中移除 MCP 连接以断开访问

我们无法控制 Anthropic 如何处理通过 Claude 对话发送的内容。请参阅 Anthropic 的隐私政策了解其数据处理方式。

## 我们不会做什么

- 我们不会出售你的数据
- 我们不会投放广告
- 我们不会使用你的内容训练 AI 模型
- 我们不会与其他用户共享你的内容，除非你明确将知识库设为公开
- 除非法律要求，我们不会出于提供服务以外的目的访问你的内容

## 公开知识库

如果你选择将知识库设为公开，其 Wiki 页面将对互联网上的任何人可见，并可能被搜索引擎索引。公开知识库中的原始资料文档不会公开，只有 Wiki 页面会公开。你可以随时将知识库重新设为私有，这会移除其公开访问。

## 数据保留与删除

只要你保留账户，我们就会存储你的内容。你可以随时删除单个文档、知识库或整个账户。

当你删除内容时：
- 文档和 Wiki 页面会从数据库中移除
- 上传文件会从 S3 中移除
- 搜索索引条目会被移除
- 删除是永久性的，除标准数据库备份窗口（7 天）外，我们不会保留已删除内容的备份

当你删除账户时：
- 所有知识库、文档、Wiki 页面和上传文件都会被永久删除
- 你的认证凭据会从 Supabase 中移除
- 此过程不可逆

如需请求删除账户，请发送邮件至 lucas@llmwiki.app。

## 你的权利

你可以随时：
- 导出你的数据，下载你的文档和 Wiki 页面
- 删除特定内容或整个账户
- 通过移除 MCP 连接断开 AI 工具访问
- 将知识库设为私有或公开
- 请求了解我们持有哪些关于你的数据，请发送邮件至 lucas@llmwiki.app

如果你位于欧盟，你在 GDPR 下享有额外权利，包括数据可携带权、更正权和删除权。请联系 lucas@llmwiki.app 行使这些权利。

## 自托管

LLM Wiki 是开源项目，采用 Apache 2.0 许可证。如果你需要完整的数据主权，可以在自己的基础设施上自托管整个系统。自托管时，数据不会经过我们的系统。部署说明请参阅 GitHub 仓库。

## 儿童

LLM Wiki 不面向 13 岁以下儿童使用。我们不会在知情情况下收集 13 岁以下儿童的个人信息。

## 本政策变更

我们可能会不时更新本政策。若发生重大变更，我们会通过邮件或在应用中发布通知。变更后继续使用本服务即表示你接受更新后的政策。

## 联系

隐私问题或数据请求请联系：lucas@llmwiki.app
`,
} as const

export type PrivacyLocale = keyof typeof privacyByLocale
