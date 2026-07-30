// By default browsers negotiate Opus audio at a fairly low bitrate (~32kbps),
// which is a common cause of muffled/robotic sounding call audio. This helper
// rewrites the SDP so Opus asks for a much higher bitrate, giving noticeably
// clearer voice. It's a no-op (returns the SDP unchanged) if it can't find an
// Opus line, so it's always safe to call.
export const boostAudioQuality = (sdp) => {
    if (!sdp) return sdp;
    try {
        const opusMatch = sdp.match(/a=rtpmap:(\d+) opus\/48000/);
        if (!opusMatch) return sdp;
        const payloadType = opusMatch[1];
        const fmtpLineRegex = new RegExp(`a=fmtp:${payloadType} .*`);

        if (fmtpLineRegex.test(sdp)) {
            return sdp.replace(fmtpLineRegex, (line) => (
                line.includes('maxaveragebitrate')
                    ? line
                    : `${line};maxaveragebitrate=128000;stereo=0;useinbandfec=1`
            ));
        }

        return sdp.replace(
            `a=rtpmap:${payloadType} opus/48000`,
            `a=rtpmap:${payloadType} opus/48000\r\na=fmtp:${payloadType} maxaveragebitrate=128000;stereo=0;useinbandfec=1`
        );
    } catch (e) {
        console.warn('Could not boost audio quality in SDP', e);
        return sdp;
    }
};
