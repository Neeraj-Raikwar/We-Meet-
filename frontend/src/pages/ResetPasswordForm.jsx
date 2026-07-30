import Box from '@mui/material/Box'; // Layout design system parameters structural display boxes containers element
import Button from '@mui/material/Button'; // Interactive actions submission controller standard system interface buttons
import TextField from '@mui/material/TextField'; // Real-time values capturing components elements input area textual fields
import Typography from '@mui/material/Typography'; // Core application typography system classes customization tracking framework parameters

// Security token processing and validation handling state functional user form presentation component
export default function ResetPasswordForm({
    username, setUsername,
    otp, setOtp,
    newPassword, setNewPassword,
    resetStep, setResetStep,
    error, setError,
    handleSendOTP, handleVerifyAndReset,
    setFormState
}) {
    return (
        <Box component="form" noValidate sx={{ width: '100%' }}>
            {/* Condition 1: Agar execution state phase status index value number 0 hai toh email verify portal trigger hoga */}
            {resetStep === 0 && (
                <>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                        Enter your registered email destination location handle profile to receive verification transmission key sequence.
                    </Typography>
                    {/* Destination check dynamic variable target mapping user validation identifier field */}
                    <TextField
                        margin="normal" required fullWidth id="reset_username"
                        label="Email or Username" name="username" value={username} autoFocus
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {/* Processing operational parameters pipeline matching logic failure alert messaging area dynamic text layout */}
                    {error && <p style={{ color: "red", marginTop: '8px' }}>{error}</p>}
                    {/* Execution trigger actions transaction dispatch method integration handler click interaction button layout */}
                    <Button
                        type="button" fullWidth variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.4, borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
                        onClick={handleSendOTP}
                    >
                        Send Verification Code
                    </Button>
                </>
            )}

            {/* Condition 2: Agar email identity verified execution path validation state token step sequence array check level status 1 ho jaye */}
            {resetStep === 1 && (
                <>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                        A verification authorization variable token sequence has been dispatched to your target address location profile.
                    </Typography>
                    {/* Six digit generated random tracking criteria dynamic verification value text integration field code */}
                    <TextField
                        margin="normal" required fullWidth id="otp"
                        label="6-Digit Verification Code" name="otp" value={otp} autoFocus
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    {/* Fresh updated cryptographic framework security variable replacement target input configuration string field */}
                    <TextField
                        margin="normal" required fullWidth name="newPassword"
                        label="New Password" value={newPassword} type="password" id="newPassword"
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {/* Logical operational failure dynamic indicator parameter value mismatch display context data text array */}
                    {error && <p style={{ color: "red", marginTop: '8px' }}>{error}</p>}
                    {/* Final transaction execution database modification overwrite handler function routing system trigger push action button */}
                    <Button
                        type="button" fullWidth variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.4, borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
                        onClick={handleVerifyAndReset}
                    >
                        Reset Password Access Matrix
                    </Button>
                </>
            )}

            {/* Verification lifecycle sequence structural processing loop cancel navigation option wrapper box block */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                {/* Visual redirection state control reset settings trigger values variable transformation handle on click trigger */}
                <Typography
                    variant="body2"
                    sx={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => {
                        setFormState(0); // Authentication main parent status key code setting reset index value toggled to login layout block view
                        setResetStep(0); // Phase transition context data initialization indexes point value reset tracking variables configuration clear
                        setError(""); // Active dynamic analytical processing framework runtime warnings layout strings container empty out
                    }}
                >
                    Back to Sign In
                </Typography>
            </Box>
        </Box>
    );
}
