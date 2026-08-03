import InfoPage from './InfoPage';

export default function Help() {
    return (
        <InfoPage title="Help &amp; Support">
            <p>
                Welcome to the WeMeet Help Center. Here are answers to the most common questions —
                if you can't find what you're looking for, reach out to us at{' '}
                <a href="mailto:support@wemeet.app" style={{ color: '#2563eb' }}>support@wemeet.app</a>.
            </p>

            <h3>How do I start a meeting?</h3>
            <p>
                Sign in, then click <b>"Create an Instant Meeting Room"</b> on your Home page. A unique meeting
                code and shareable link are generated instantly — send that link to anyone you want to invite.
            </p>

            <h3>How do I join a meeting?</h3>
            <p>
                Paste the meeting code or the full link into the <b>"Enter Meeting Code or Paste Link"</b> box
                on your Home page and click Join. You can also open a shared link directly in your browser.
            </p>

            <h3>Do I need an account to join a call?</h3>
            <p>
                No — guests can join a call directly from a shared link without signing up. However, creating
                an account lets you see your meeting history and lets the host approve you to join instantly
                next time.
            </p>

            <h3>Why does the host need to "admit" me?</h3>
            <p>
                For privacy and security, the first person to open a meeting room becomes the host. Anyone
                joining afterwards waits in a lobby until the host admits them — this prevents uninvited
                people from joining your calls.
            </p>

            <h3>I forgot my password — what do I do?</h3>
            <p>
                On the sign-in page, click <b>"Forgot password?"</b>, enter your email, and we'll send a
                6-digit verification code that's valid for 5 minutes. Enter it along with a new password to
                regain access.
            </p>

            <h3>Screen sharing or audio isn't working — any tips?</h3>
            <ul>
                <li>Make sure your browser has permission to access your camera, microphone, and screen.</li>
                <li>Use an up-to-date version of Chrome or Edge for the best compatibility (including live transcription).</li>
                <li>If you're on a restrictive Wi-Fi network (office/college), try switching to mobile data or a different network.</li>
            </ul>

            <h3>Still need help?</h3>
            <p>
                Email us at <a href="mailto:support@wemeet.app" style={{ color: '#2563eb' }}>support@wemeet.app</a> and
                we'll get back to you as soon as we can.
            </p>
        </InfoPage>
    );
}
