# LLM Wiki Quick Start

拿到代码后，按下面几步即可启动并开始用 AI 工具整理 wiki。

## 1. 准备环境

要求：

- Python 3.11+
- Node.js 20+

## 2. 安装并启动

macOS：

```bash
./setup-mac.sh ~/research
```

Windows：

```powershell
.\setup-win.ps1 C:\research
```

脚本会自动完成：

- 安装 API 依赖
- 安装 MCP 依赖
- 安装前端依赖
- 初始化工作区
- 启动本地服务

启动后会打开本地页面：

```text
http://localhost:3000
```

## 3. 把资料放进去

直接把资料放进工作区文件夹即可，例如：

```bash
cp ~/Downloads/paper.pdf ~/research/
cp ~/Downloads/report.docx ~/research/
mv ~/notes ~/research/
```

支持格式：

- PDF
- Word
- Excel
- Markdown
- HTML
- 图片
- CSV

如果你已经启动了服务，新增文件后不用额外操作。watcher 会自动索引；如果服务没开，重启后也会补索引。

## 4. 先让 AI 接入

在你常用的 AI 工具里配置这个项目的 MCP。支持的工具包括：

- Cursor
- Claude Desktop
- Claude Code
- 其他支持 MCP 的工具

先生成配置：

```bash
./llmwiki mcp-config ~/research
```

把输出的 JSON 粘贴到对应工具的 MCP 配置入口里。

## 5. AI 第一轮怎么说

第一次接入时，直接对 AI 说：

```text
先读一下 guide，然后把我所有资料都导入，开始搭建 wiki。
```

这一步会让 AI 先理解工作区，再开始读文件、建页面、补引用。

## 6. 增加了新文档之后怎么办

把新文件直接放进工作区就行，不需要手动导入。

如果服务正在运行：

- watcher 会自动发现新文件
- 新文件会自动进入索引
- 你可以直接继续问 AI

如果服务没有运行：

- 先重新启动 `./llmwiki open ~/research`
- 启动后会自动做增量扫描

如果你想让 AI 专门检查新资料，可以再说：

```text
我加了新文件，请检查有没有还没引用的来源，并把它们导入。
```

## 7. 常用命令

```bash
./llmwiki open ~/research
./llmwiki init ~/research
./llmwiki serve ~/research
./llmwiki mcp-config ~/research
./llmwiki reindex ~/research
```

## 8. 推荐流程

```text
拿到代码 → 跑 setup 脚本 → 放资料 → 配置 MCP → 让 AI 读 guide 并开始建 wiki → 持续加文件，watcher 自动索引
```

停服期间也可以继续往工作区里放文件，重启后会自动补索引。

如果索引出问题，执行：

```bash
./llmwiki reindex ~/research
```
