# LLM Wiki

[![License](https://img.shields.io/badge/license-Apache%202.0-green)](https://opensource.org/licenses/Apache-2.0)

LLM Wiki 是一个开源的本地优先知识库，实现了 Karpathy 提出的 LLM Wiki 思路。

它适合用来整理研究资料、论文、笔记、网页、表格和其他文件。你把它指向一个文件夹，启动本地应用，再通过 MCP 连接 Claude。Claude 可以读取你的资料、在 `wiki/` 目录下写 Markdown 页面，并持续维护链接、引用和总结。

![LLM Wiki — a compiled wiki page with citations and table of contents](wiki-page.png)

## 它会做什么

1. **你提供一个文件夹**：里面可以是 PDF、笔记、文章、表格等已有资料。
2. **LLM Wiki 建立索引**：本地提取文本、切分内容、创建 SQLite 索引。源文件不会被移动或修改。
3. **Claude 通过 MCP 连接**：读取源资料，在 `wiki/` 下写页面，维护交叉引用和脚注引用。
4. **Wiki 持续变好**：随着 Claude 读取更多资料、写入更多页面，摘要、实体页、链接和引用会逐步积累。

## 快速开始

**要求：**

- Python 3.11+
- Node.js 20+
- macOS/Linux：Bash
- Windows：PowerShell

如果你只想看“启动后怎么在 AI 工具里开始用”，直接看 [Quick Start 手册](QUICKSTART.zh-CN.md)。

### 一键 setup 并启动

macOS：

```bash
./setup-mac.sh ~/research
```

Windows：

```powershell
.\setup-win.ps1 C:\research
```

如果不传工作区路径，脚本会使用默认目录：

- macOS/Linux：`~/llmwiki-workspace`
- Windows：`%USERPROFILE%\llmwiki-workspace`

脚本会自动完成：

- 创建 `api/.venv` 并安装 API 依赖
- 创建 `mcp/.venv` 并安装 MCP 依赖
- 安装 `web` 前端依赖
- 初始化工作区
- 启动本地 API 和 Web 应用
- 打开浏览器访问本地页面

启动后打开：

```text
http://localhost:3000
```

## 手动安装

macOS/Linux：

```bash
git clone https://github.com/lucasastorian/llmwiki.git
cd llmwiki

cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..

cd mcp
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..

cd web
npm install
cd ..

./llmwiki init ~/research
./llmwiki serve ~/research
```

Windows PowerShell：

```powershell
git clone https://github.com/lucasastorian/llmwiki.git
cd llmwiki

cd api
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..

cd mcp
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..

cd web
npm install
cd ..

python .\llmwiki init C:\research
python .\llmwiki serve C:\research
```

## 连接 Claude

运行：

```bash
./llmwiki mcp-config ~/research
```

Windows：

```powershell
python .\llmwiki mcp-config C:\research
```

它会输出一段 JSON 配置，可以添加到 Claude Desktop 的 `claude_desktop_config.json`，或者 Claude Code 的 `.claude/settings.json`。

一个工作区对应一个 MCP server。如果你有多个研究项目，建议每个项目使用独立文件夹和独立 MCP 配置。

连接后可以对 Claude 说：

```text
先读一下 guide，然后把我的资料导入，开始搭建 wiki。
```

## CLI 命令

| 命令 | 作用 |
|------|------|
| `llmwiki open <folder>` | 初始化、启动服务并打开浏览器 |
| `llmwiki init <folder>` | 创建 `.llmwiki/`、`wiki/`，并索引已有文件 |
| `llmwiki serve <folder>` | 启动 API `:8000` 和 Web `:3000` |
| `llmwiki mcp <folder>` | 运行 stdio MCP server |
| `llmwiki mcp-config <folder>` | 输出 Claude MCP 配置片段 |
| `llmwiki reindex <folder>` | 从磁盘文件重建索引 |

Windows 上如果不能直接执行 `llmwiki`，使用：

```powershell
python .\llmwiki <command> <folder>
```

## 工作区目录结构

LLM Wiki 会在你的工作区里添加两个目录。源文件不会被移动或修改。

```text
~/research/
  papers/paper.pdf
  notes.md
  data.xlsx
  wiki/
    overview.md
    log.md
    concepts/
      attention.md
  .llmwiki/
    index.db
    cache/
```

- `wiki/`：普通 Markdown 文件。你可以用任何编辑器修改，Claude 也会通过 MCP 写入和更新。
- `.llmwiki/`：SQLite 索引和处理后的缓存文件。它是可重建数据，必要时可以通过 `llmwiki reindex` 重建。

默认情况下，索引、存储和文件写入都发生在本机，不需要云服务。

## Claude 可以使用的工具

连接 MCP 后，Claude 可以使用这些工具：

| 工具 | 说明 |
|------|------|
| `guide` | 解释 wiki 工作方式，并列出工作区内容 |
| `search` | 浏览文件或全文搜索 |
| `read` | 读取文档，支持 PDF 页码范围和 glob 批量读取 |
| `write` | 创建 wiki 页面、替换文本、追加内容，也支持 SVG/CSV 资产 |
| `delete` | 按路径或 glob 删除文档 |

所有写入都会先落到磁盘，再更新搜索索引。例如 Claude 创建 `/wiki/concepts/attention.md` 后，这个文件会立即出现在你的工作区里。

## 架构

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│   FastAPI    │────▶│   SQLite     │
│   前端       │     │   后端       │     │   本地索引   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │  MCP Server  │◀──── Claude Desktop / Code
                     │   stdio      │
                     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │  Filesystem  │  ← 真实数据源
                     └──────────────┘
```

文件系统是真实数据源。SQLite 是派生索引，用于加速搜索和保存提取后的页面数据。它可以随时从文件重新构建。后台 watcher 会监听你在应用外对文件做出的修改。

## 文档处理

基础使用不需要 API key，处理流程默认在本地运行。

| 格式 | 处理方式 | 说明 |
|------|----------|------|
| PDF | pdf-oxide | Rust 文本提取，适合文本型论文。扫描版 PDF 仍建议使用 OCR。 |
| Markdown/Text | 原生处理 | 直接索引和切分 |
| HTML | webmd | 去除导航和广告，提取干净 Markdown |
| Excel/CSV | openpyxl | 按 sheet 提取 |
| 图片 | 原样保存 | 可在界面内查看 |
| Word/PowerPoint | LibreOffice | 可选。安装 LibreOffice 后可转换 Office 文件；未安装时会保存但不提取正文。 |

如果设置 `MISTRAL_API_KEY`，PDF OCR 的表格和版面识别质量会更好。默认的 pdf-oxide 免费且适合大多数文本型 PDF。

## 限制和取舍

- **一个工作区对应一个 MCP server。** 多个研究项目建议拆成多个文件夹，分别配置 MCP。
- **PDF 表格提取有限。** pdf-oxide 对正文效果较好，但表格会比较粗糙。财报、数据型 PDF 更适合用 Mistral OCR。
- **LibreOffice 增加安装成本。** Office 文件转换依赖本地 LibreOffice。如果你主要处理 PDF 和 Markdown，可以不安装。
- **本地模式没有向量搜索。** 本地全文搜索使用 SQLite FTS5，适合关键词搜索，不做语义向量检索。

## 多租户托管版本

如果你要运行类似 `llmwiki.app` 的托管版本，需要 Postgres、Supabase Auth 和 S3。

<details>
<summary>托管版本安装说明</summary>

### 前置要求

- Python 3.11+
- Node.js 20+
- Supabase 项目
- S3 兼容存储桶

### 数据库

```bash
psql $DATABASE_URL -f supabase/migrations/001_initial.sql
```

### API

```bash
cd api
pip install -r requirements.txt
MODE=hosted DATABASE_URL=postgresql://... uvicorn main:app --port 8000
```

### MCP Server

```bash
cd mcp
pip install -r requirements.txt
MODE=hosted DATABASE_URL=postgresql://... uvicorn server:app --port 8080
```

### Web

```bash
cd web
npm install
NEXT_PUBLIC_MODE=hosted \
NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
NEXT_PUBLIC_API_URL=http://localhost:8000 \
npm run dev
```

### 环境变量

API：

```text
MODE=hosted
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-ref.supabase.co
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=your-bucket
MISTRAL_API_KEY=
CONVERTER_URL=
```

Web：

```text
NEXT_PUBLIC_MODE=hosted
NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

</details>

## 为什么不只是一个静态笔记文件夹

个人 wiki 通常不是因为没有资料失败，而是因为维护成本太高。有人必须不断更新链接、修正过期总结、合并重复页面，并让引用和源材料保持一致。资料越多，这些工作越难持续。

LLM Wiki 把这些重复编辑工作交给 Claude。你负责选择资料和提出分析方向；Claude 负责维护交叉引用、更新总结、标记矛盾，并在新资料影响多个页面时同步修改相关内容。

## 许可证

Apache 2.0
