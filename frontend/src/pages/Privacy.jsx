import InfoPage from './InfoPage';

export default function Privacy() {
    return (
        <InfoPage title="Privacy Policy">
            <p><i>Last updated: {new Date().getFullYear()}</i></p>

            <p>
                This Privacy Policy explains what information WeMeet collects, how it's used, and the choices
                you have.
            </p>

            <h3>Information We Collect</h3>
            <ul>
                <li><b>Account information</b> — your name, email address, and a securely hashed password when you register.</li>
                <li><b>Meeting activity</b> — meeting codes you create or join, the date/time, and call duration, so you can see them in your History.</li>
                <li><b>Media during a call</b> — your camera and microphone are only accessed with your permission, and video/audio is sent directly, peer-to-peer, between call participants — it does not pass through or get stored on our servers.</li>
                <li><b>In-call messages and reactions</b> — chat messages sent during a call are relayed for the duration of that call and are not stored permanently.</li>
                <li><b>Live transcription</b> — if you enable live captions, speech-to-text conversion happens locally in your browser.</li>
            </ul>

            <h3>How We Use Your Information</h3>
            <ul>
                <li>To let you sign in and access your account and meeting history.</li>
                <li>To connect you with other participants when you create or join a meeting.</li>
                <li>To send account-related emails, such as password-reset codes.</li>
                <li>To improve the reliability and performance of the Service.</li>
            </ul>

            <h3>Third-Party Services</h3>
            <p>
                If you choose to sign in with Google or Facebook, we receive basic profile information (such
                as your name and email) from that provider to create or match your account. We use a
                third-party email provider to deliver verification codes and other account emails.
            </p>

            <h3>Cookies &amp; Local Storage</h3>
            <p>
                WeMeet uses your browser's local storage to keep you signed in between visits and to remember
                your light/dark theme preference. This data stays on your device and is not shared with third
                parties.
            </p>

            <h3>Data Retention</h3>
            <p>
                Account and meeting-history data is kept for as long as your account is active. You can
                request deletion of your account and associated data at any time by contacting us.
            </p>

            <h3>Your Choices</h3>
            <p>
                You can update your account details, delete meeting history entries, or request full account
                deletion at any time. You always control camera, microphone, and screen-sharing permissions
                through your browser.
            </p>

            <h3>Contact Us</h3>
            <p>
                Questions about this Privacy Policy? Email us at{' '}
                <a href="mailto:support@wemeet.app" style={{ color: '#2563eb' }}>support@wemeet.app</a>.
            </p>
        </InfoPage>
    );
}
