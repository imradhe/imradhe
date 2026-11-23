// Turns the admin's plain-text page into the same markup the original pages used, so the styling
// stays fixed in code. Everything is escaped first, so the text can never add HTML or scripts.
const escapeText = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const inline = value => escapeText(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
export const labelledPages = ['skills', 'interests'];
export const pageHelp = {
  about: 'Blank line starts a new paragraph. A line starting with "> " is the quote at the top. A line that says exactly [more] starts the Read More part. **text** is bold. The Download Resume button is added automatically.',
  skills: 'Each block is one group: the first line is the heading, the next line is its text. Leave a blank line between groups. **text** is bold.',
  interests: 'Each block is one group: the first line is the heading, the next line is its text. Leave a blank line between groups. **text** is bold.'
};
export function pageBlocks(text) {
  return String(text ?? '').split(/\n\s*\n/).map(block => block.split('\n').map(line => line.trim()).filter(Boolean)).filter(block => block.length);
}
export function pageToHtml(key, text) {
  const visible = []; const hidden = []; let target = visible; let readMore = false;
  for (const lines of pageBlocks(text)) {
    if (key === 'about' && lines.length === 1 && lines[0] === '[more]') { target = hidden; readMore = true; continue; }
    if (labelledPages.includes(key)) {
      const [label, ...rest] = lines;
      target.push({ html: `<b>${inline(label)}</b>${rest.length ? `<p>${inline(rest.join(' '))}</p>` : ''}`, block: true });
    } else if (lines[0].startsWith('> ')) {
      target.push({ html: `<blockquote class="text-center"><strong><q>${inline(lines[0].slice(2))}</q></strong></blockquote>`, quote: true });
      if (lines.length > 1) target.push({ html: inline(lines.slice(1).join(' ')) });
    } else target.push({ html: inline(lines.join(' ')) });
  }
  // Blank line between blocks, except after a quote (which is already a block element).
  const join = items => items.reduce((out, item, index) => out + (index && !items[index - 1].quote ? '<br><br>' : '') + item.html, '');
  if (labelledPages.includes(key)) return visible.map(item => item.html).join('');
  let html = join(visible);
  if (key === 'about') {
    if (hidden.length) html += `<span class="collapse" id="expand"><br><br>${join(hidden)}</span> <a style="cursor:pointer; text-decoration:underline;" data-bs-toggle="collapse" data-bs-target="#expand"><span onclick="this.style.display='none'">Read More</span></a>`;
    html += '<div class="text-center mt-3 mb-5 pb-5"><a target="_blank" href="/assets/docs/ImRadheResume.pdf" class="btn btn-dark"><i class="bi bi-download"></i> Download Resume</a></div>';
  }
  return html;
}
