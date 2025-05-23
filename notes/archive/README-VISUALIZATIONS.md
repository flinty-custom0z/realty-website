# Real Estate Website Codebase Visualizations

This directory contains various visualization files to help understand the structure, architecture, and relationships within the real estate website codebase.

## Available Visualizations

1. **CODEBASE_OVERVIEW.md** - Comprehensive document containing all visualizations and analysis
2. **dependency-graph.mmd** - Mermaid diagram showing module dependencies
3. **component-hierarchy.mmd** - Mermaid diagram showing React component hierarchy
4. **data-model.mmd** - Mermaid ER diagram showing database relationships
5. **diagram-viewer.html** - Interactive HTML page to view all diagrams

## How to Use These Files

### Quick Web Viewer

The easiest way to view the diagrams is to open the `diagram-viewer.html` file in any modern web browser. This page includes all three diagrams with interactive tabs to switch between them.

```
open diagram-viewer.html
```

### Viewing Mermaid Files

You can view individual Mermaid diagram files (.mmd extension) using:

1. **VS Code Mermaid Extension**
   - Install the "Markdown Preview Mermaid Support" extension
   - Open the .mmd file
   - Press Ctrl+Shift+V (or Cmd+Shift+V on Mac) to open preview

2. **Mermaid Live Editor**
   - Go to https://mermaid.live/
   - Copy the content of the .mmd file into the editor

3. **Command Line with mermaid-cli**
   - Install mermaid-cli: `npm install -g @mermaid-js/mermaid-cli`
   - Generate SVG: `mmdc -i file.mmd -o file.svg`

### Comprehensive Report

The `CODEBASE_OVERVIEW.md` document contains all diagrams embedded in Markdown along with detailed analysis and recommendations. View it with any markdown viewer or directly on GitHub.

## Keeping Visualizations Updated

As the codebase evolves, you may want to update these visualizations. Here are some tools to help:

### For Dependency Analysis
```bash
# Install madge for dependency analysis
npm install -g madge

# Generate dependency graph
madge --image dependency-graph.png --exclude "node_modules" src/
```

### For API Endpoint Documentation
```bash
# Use a tool like swagger-autogen to document endpoints
npm install swagger-autogen
```

### For Schema/Entity Relationship Diagrams
```bash
# Generate up-to-date schema from Prisma
npx prisma generate
```

## Recommended Visualization Workflow

1. Update visualization files when making significant architectural changes
2. Include visualization updates in code reviews for complex changes
3. Use visualizations for onboarding new team members
4. Review visualizations quarterly to identify refactoring opportunities

## Additional Tools

For more advanced visualization needs, consider these tools:

- **Statoscope** - For webpack bundle analysis
- **React Developer Tools** - For component debugging
- **Lighthouse** - For performance analysis
- **NDepend** - For more advanced dependency analysis 