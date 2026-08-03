import InfoPage from './InfoPage';

export default function Terms() {
    return (
        <InfoPage title="Terms of Service">
            <p><i>Last updated: {new Date().getFullYear()}</i></p>

            <p>
                These Terms of Service ("Terms") govern your use of WeMeet ("the Service"). By creating an
                account, joining a meeting, or otherwise using the Service, you agree to these Terms.
            </p>

            <h3>1. Using WeMeet</h3>
            <p>
                You may use WeMeet to host and join video meetings, subject to these Terms. You're responsible
                for the accuracy of the information you provide (such as your name and email) and for keeping
                your account credentials secure.
            </p>

            <h3>2. Acceptable Use</h3>
            <ul>
                <li>Do not use the Service for any unlawful, harmful, or abusive purpose.</li>
                <li>Do not attempt to disrupt, overload, or gain unauthorized access to the Service or other users' accounts.</li>
                <li>Do not record, share, or distribute a meeting without the consent of the other participants.</li>
                <li>Meeting hosts are responsible for who they admit into their meetings.</li>
            </ul>

            <h3>3. Accounts</h3>
            <p>
                You may create an account with an email and password, or sign in using a supported third-party
                provider. You're responsible for all activity that occurs under your account.
            </p>

            <h3>4. Availability</h3>
            <p>
                We aim to keep WeMeet available and reliable, but the Service is provided on an "as is" basis
                without guarantees of uninterrupted access. Features such as call quality depend on your
                device, browser, and network conditions.
            </p>

            <h3>5. Limitation of Liability</h3>
            <p>
                To the fullest extent permitted by law, WeMeet is not liable for indirect, incidental, or
                consequential damages arising from your use of the Service.
            </p>

            <h3>6. Changes to These Terms</h3>
            <p>
                We may update these Terms from time to time. Continued use of the Service after changes are
                posted constitutes acceptance of the revised Terms.
            </p>

            <h3>7. Contact</h3>
            <p>
                Questions about these Terms? Email us at{' '}
                <a href="mailto:support@wemeet.app" style={{ color: '#2563eb' }}>support@wemeet.app</a>.
            </p>
        </InfoPage>
    );
}
