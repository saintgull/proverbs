# CLAUDE PROVERBS - QUICK REFERENCE

## By Problem Type

### When facing bugs
- All bugs are shallow to many eyes.
- Change one thing at a time.
- Reproducing bugs is half the solution.
- Console.log is your guiding light.
- Bisect problems to find sources.
- Read error messages before seeking help.
- Intermittent bugs hide in race conditions.
- Browser cache hides many truths.

### When optimizing
- Premature optimization is the root of evil.
- If it ain't broke, don't fix it.
- Test what you can, trust what you test.
- Performance perceived is reality experienced.
- Start simple, add complexity only when needed.

### When designing features
- A function should do one thing and do it well.
- Users don't read, they scan.
- Path of least surprise creates best UX.
- Responsive design or no design.
- First click should be right click.
- Test with actual users, not assumptions.

### When coding
- Naming is hardest problem after cache invalidation.
- Simplest solution is usually best.
- Validate input, sanitize output.
- Simpler today prevents debugging tomorrow.
- Small PRs get better reviews.
- Comment your regex or be forgotten.

### When collaborating
- Honor code reviewers by preparing thoroughly.
- Document decisions, not just code.
- Pair on complex problems.
- Hidden mistakes prevent team learning.
- Over-communication beats under-communication.
- Share credit, own failures.

### When securing
- Never trust user input.
- Least privilege prevents most problems.
- Secrets in repositories are already leaked.
- Assume breach, plan recovery.
- Outdated dependencies are security holes.
- Passwords alone provide no security.

### When implementing
- Fewer simultaneous changes means fewer bugs.
- Create directories before referencing them.
- Use consistent path conventions.
- Test each significant change immediately.
- Consider port conflicts before launching services.
- Local verification doesn't guarantee production success.

### When using tools
- BatchTool runs concurrently what tools run sequentially.
- GlobTool for files, GrepTool for content, agent for complexity.
- View before Edit, understand before changing.
- The specific search finds what the general search misses.
- Edit with context; include lines before and after changes.
- Dispatch an agent when searches become explorations.

### When using Git
- Commit often, push deliberately.
- Review changes before committing.
- Write commit messages that explain why, not what.
- Test before pushing to shared branches.
- Pull before starting work to avoid merge conflicts.
- Branch for features, not for fixes.
- Never commit directly to main in shared repos.
- Use .gitignore before committing sensitive files.

### When reflecting on process
- Document both successes and failures.
- Note patterns that repeat across projects.
- Identify bottlenecks in your workflow, not just the code.
- Record assumptions that proved incorrect.
- Create checklists from repeated mistakes.
- Journal decision points, not just outcomes.
- Write notes as if speaking to your future self.
- Organize reflections by pattern, not chronology.
- Review past notes before starting similar projects.
- Connect insights across different domains and projects.

## Command to Load Proverbs

Add this to your .bashrc or .zshrc to easily load the proverbs:

```bash
function claude-wisdom {
  cat ~/P/CLAUDE_PROVERBS.md | grep -A 2 "$1" | tail -n 1
}
```

Usage: `claude-wisdom bugs` or `claude-wisdom optimizing`