import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Streak, { practice } from './Streak';
import { AuthForm, afterLoginPath } from './Auth';
import { api } from '../api';
import { srtTime, toSrt } from './Dhwani';
import OriginalMarkup, { isAppPath } from '../original/OriginalMarkup';
import { pageToHtml } from '../original/pageText';
vi.mock('../auth', () => ({ useAuth: () => ({ user: null, accept: vi.fn() }) }));
vi.mock('../api', () => ({ api: vi.fn() }));
const wrap = component => render(<MemoryRouter>{component}</MemoryRouter>);

describe('original streak behavior', () => {
  it('keeps the original third-day reward formula and 24-hour check-in interval', () => {
    const original = { days: 1, daily: 10, reward: 0, lastClicked: 1000 };
    expect(practice(original, true, 2000)).toBe(original);
    const second = practice(original, true, 1000 + 86400000);
    expect(second.days).toBe(2); expect(second.reward).toBe(0);
    const third = practice(second, true, 1000 + 2 * 86400000);
    expect(third.days).toBe(3); expect(third.reward).toBe(20);
  });
  it('uses the original setup controls, completion screen, and New Streak action', () => {
    wrap(<Streak/>);
    fireEvent.change(screen.getByPlaceholderText('Enter your streak title'), { target: { value: 'Read daily' } });
    fireEvent.change(screen.getByPlaceholderText('Enter target reward in ₹'), { target: { value: '20' } });
    fireEvent.change(screen.getByPlaceholderText('Enter daily reward in ₹'), { target: { value: '10' } });
    fireEvent.click(screen.getByText('Start Streak'));
    fireEvent.click(screen.getByText('Practice for the day'));
    expect(document.querySelector('#streak')).toHaveTextContent('2');
    expect(document.querySelector('#reward')).toHaveTextContent('₹0');
    fireEvent.click(screen.getByText('Practice for the day'));
    expect(screen.getByText('Congrats! You reached your target')).toBeVisible();
    expect(document.querySelector('#successReward')).toHaveTextContent('₹20');
    fireEvent.click(screen.getByText('New Streak'));
    expect(screen.getByText('Start Streak')).toBeVisible();
  });
});
describe('original account form', () => {
  it('retains the phone field, password toggle, original labels and registration payload', async () => {
    api.mockResolvedValue({ user: { role: 'user' }, csrf: 'token' });
    wrap(<AuthForm register/>);
    expect(screen.getByText('User Registration')).toBeInTheDocument();
    const password = screen.getByPlaceholderText('Password');
    fireEvent.click(screen.getByText('Show Password'));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByText('Hide Password'));
    expect(password).toHaveAttribute('type', 'password');
    for (const [placeholder, value] of [['Name', 'Original User'], ['Email', 'original@example.test'], ['phone', '9876543210'], ['Password', 'Original-123!']]) fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Register', exact: true }));
    await waitFor(() => expect(api).toHaveBeenCalledWith('/auth/register', { method: 'POST', body: { name: 'Original User', email: 'original@example.test', phone: '9876543210', password: 'Original-123!' } }));
  });
});
describe('post-login redirect', () => {
  it('sends admins to /admin and everyone else home when there is no next parameter', () => {
    expect(afterLoginPath(null, 'admin')).toBe('/admin');
    expect(afterLoginPath(null, 'user')).toBe('/');
    expect(afterLoginPath(undefined, undefined)).toBe('/');
    expect(afterLoginPath('', 'admin')).toBe('/admin');
  });
  it('honours a safe next path for every role', () => {
    expect(afterLoginPath('/admin/stories', 'admin')).toBe('/admin/stories');
    expect(afterLoginPath('/blog/hello', 'user')).toBe('/blog/hello');
    expect(afterLoginPath('/', 'admin')).toBe('/');
  });
  it('ignores off-site or malformed next values', () => {
    for (const bad of ['//evil.example', 'https://evil.example', '/\\evil.example', 'admin', 'javascript:alert(1)']) {
      expect(afterLoginPath(bad, 'user')).toBe('/');
      expect(afterLoginPath(bad, 'admin')).toBe('/admin');
    }
  });
});

describe('client-side navigation', () => {
  it('turns same-app links into router links and leaves external, asset and download links alone', () => {
    const html = '<a href="/blog" class="x">blog</a><a href="https://github.com/imradhe">gh</a><a href="/assets/docs/ImRadheResume.pdf">cv</a><a href="/files/a.pdf" download>dl</a>';
    const { container } = wrap(<OriginalMarkup html={html}/>);
    const links = [...container.querySelectorAll('a')];
    expect(links[0].getAttribute('href')).toBe('/blog');
    expect(links[0].className).toBe('x');
    expect(links[1].getAttribute('href')).toBe('https://github.com/imradhe');
    expect(links[2].getAttribute('href')).toBe('/assets/docs/ImRadheResume.pdf');
  });
  it('classifies app paths correctly', () => {
    expect(isAppPath('/admin/stories')).toBe(true);
    expect(isAppPath('/scene/short-stories-1-1-1')).toBe(true);
    expect(isAppPath('/assets/img/a.jpg')).toBe(false);
    expect(isAppPath('/api/auth/me')).toBe(false);
    expect(isAppPath('//evil.example')).toBe(false);
    expect(isAppPath('https://imradhe.com')).toBe(false);
    expect(isAppPath('/doc.pdf?x=1')).toBe(false);
  });
});

describe('text pages', () => {
  it('renders labelled skills blocks with the original bold heading and paragraph markup', () => {
    expect(pageToHtml('skills', 'Design\nFigma, UI/UX\n\nDomains\nTTS <script>x</script>')).toBe('<b>Design</b><p>Figma, UI/UX</p><b>Domains</b><p>TTS &lt;script&gt;x&lt;/script&gt;</p>');
  });
  it('keeps About text escaped, puts the quote first, and wraps everything after [more] in the Read More section', () => {
    const html = pageToHtml('about', '> Quote here\n\n**Bold** text <img src=x onerror=alert(1)>\n\n[more]\n\nHidden part');
    expect(html.startsWith('<blockquote class="text-center"><strong><q>Quote here</q></strong></blockquote><strong>Bold</strong> text &lt;img')).toBe(true);
    expect(html).toContain('<span class="collapse" id="expand"><br><br>Hidden part</span>');
    expect(html).toContain('data-bs-target="#expand"');
    expect(html).toContain('Download Resume');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });
});

describe('subtitle export', () => {
  it('formats millisecond boundaries and exports each line with its own timestamp', () => {
    expect(srtTime(59.9996)).toBe('00:01:00,000');
    expect(srtTime(3661.25)).toBe('01:01:01,250');
    const srt = toSrt([{ line: 'First line', start: 0 }, { line: 'Not timed', start: null }, { line: 'Last line', start: 4 }], 8);
    expect(srt).toBe('1\n00:00:00,000 --> 00:00:04,000\nFirst line\n\n2\n00:00:04,000 --> 00:00:08,000\nLast line\n');
    expect(srt).not.toContain('Not timed');
  });
});
