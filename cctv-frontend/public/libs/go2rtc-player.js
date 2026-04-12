/**
 * Combined and Modified VideoRTC for go2rtc (Clean Version - No Overlay)
 */

class VideoRTC extends HTMLElement {
    constructor() {
        super();

        this.DISCONNECT_TIMEOUT = 1000;
        this.RECONNECT_TIMEOUT = 15000;

        this.CODECS = [
            'avc1.640029',      // H.264 high 4.1 (Chromecast 1st and 2nd Gen)
            'avc1.64002A',      // H.264 high 4.2 (Chromecast 3rd Gen)
            'avc1.640033',      // H.264 high 5.1 (Chromecast with Google TV)
            'hvc1.1.6.L153.B0', // H.265 main 5.1 (Chromecast Ultra)
            'mp4a.40.2',        // AAC LC
            'mp4a.40.5',        // AAC HE
            'flac',             // FLAC (PCM compatible)
            'opus',             // OPUS Chrome, Firefox
        ];

        this.mode = 'webrtc,mse,hls'; // Removed mjpeg default
        this.media = 'video,audio';
        this.background = false;
        this.visibilityThreshold = 0;
        this.visibilityCheck = true;

        this.pcConfig = {
            bundlePolicy: 'max-bundle',
            iceServers: [{urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302']}],
            sdpSemantics: 'unified-plan',
        };

        this.wsState = WebSocket.CLOSED;
        this.pcState = WebSocket.CLOSED;
        this.video = null;
        this.ws = null;
        this.wsURL = '';
        this.pc = null;
        this.connectTS = 0;
        this.mseCodecs = '';
        this.disconnectTID = 0;
        this.reconnectTID = 0;
        this.ondata = null;
        this.onmessage = null;
    }

    set src(value) {
        if (typeof value !== 'string') value = value.toString();
        if (value.startsWith('http')) {
            value = 'ws' + value.substring(4);
        } else if (value.startsWith('/')) {
            value = 'ws' + location.origin.substring(4) + value;
        }
        this.wsURL = value;
        this.onconnect();
    }

    play() {
        this.video.play().catch(() => {
            if (!this.video.muted) {
                this.video.muted = true;
                this.video.play().catch(er => {
                    console.warn(er);
                });
            }
        });
    }

    send(value) {
        if (this.ws) this.ws.send(JSON.stringify(value));
    }

    codecs(isSupported) {
        return this.CODECS
            .filter(codec => this.media.includes(codec.includes('vc1') ? 'video' : 'audio'))
            .filter(codec => isSupported(`video/mp4; codecs="${codec}"`)).join();
    }

    connectedCallback() {
        if (this.disconnectTID) {
            clearTimeout(this.disconnectTID);
            this.disconnectTID = 0;
        }
        if (this.video) {
            const seek = this.video.seekable;
            if (seek.length > 0) {
                this.video.currentTime = seek.end(seek.length - 1);
            }
            this.play();
        } else {
            this.oninit();
        }
        this.onconnect();
    }

    disconnectedCallback() {
        if (this.background || this.disconnectTID) return;
        if (this.wsState === WebSocket.CLOSED && this.pcState === WebSocket.CLOSED) return;
        this.disconnectTID = setTimeout(() => {
            if (this.reconnectTID) {
                clearTimeout(this.reconnectTID);
                this.reconnectTID = 0;
            }
            this.disconnectTID = 0;
            this.ondisconnect();
        }, this.DISCONNECT_TIMEOUT);
    }

    oninit() {
        this.video = document.createElement('video');
        this.video.controls = true;
        this.video.playsInline = true;
        this.video.preload = 'auto';
        this.video.style.display = 'block';
        this.video.style.width = '100%';
        this.video.style.height = '100%';
        this.appendChild(this.video);

        this.video.addEventListener('error', ev => {
            if (this.ws) this.ws.close();
        });

        if (this.background) return;

        if ('hidden' in document && this.visibilityCheck) {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.disconnectedCallback();
                } else if (this.isConnected) {
                    this.connectedCallback();
                }
            });
        }
    }

    onconnect() {
        if (!this.isConnected || !this.wsURL || this.ws || this.pc) return false;
        this.wsState = WebSocket.CONNECTING;
        this.connectTS = Date.now();
        this.ws = new WebSocket(this.wsURL);
        this.ws.binaryType = 'arraybuffer';
        this.ws.addEventListener('open', () => this.onopen());
        this.ws.addEventListener('close', () => this.onclose());
        return true;
    }

    ondisconnect() {
        this.wsState = WebSocket.CLOSED;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.pcState = WebSocket.CLOSED;
        if (this.pc) {
            this.pc.getSenders().forEach(sender => {
                if (sender.track) sender.track.stop();
            });
            this.pc.close();
            this.pc = null;
        }
        
        // 🚀 Cleanup without triggering DOMExceptions
        if (this.video) {
            try {
                this.video.pause();
                if (this.video.srcObject) {
                    const stream = this.video.srcObject;
                    if (stream instanceof MediaStream) {
                        stream.getTracks().forEach(track => track.stop());
                    }
                    this.video.srcObject = null;
                }
                this.video.removeAttribute('src');
                this.video.load();
            } catch (e) {
                console.warn('[VideoRTC] Cleanup warning:', e);
            }
        }
    }

    onopen() {
        this.wsState = WebSocket.OPEN;
        this.ws.addEventListener('message', ev => {
            if (typeof ev.data === 'string') {
                const msg = JSON.parse(ev.data);
                for (const mode in this.onmessage) {
                    this.onmessage[mode](msg);
                }
            } else {
                if (this.ondata) this.ondata(ev.data);
            }
        });
        this.ondata = null;
        this.onmessage = {};
        const modes = [];
        if (this.mode.includes('mse') && ('MediaSource' in window || 'ManagedMediaSource' in window)) {
            modes.push('mse');
            this.onmse();
        } else if (this.mode.includes('hls') && this.video.canPlayType('application/vnd.apple.mpegurl')) {
            modes.push('hls');
            this.onhls();
        }
        if (this.mode.includes('webrtc') && 'RTCPeerConnection' in window) {
            modes.push('webrtc');
            this.onwebrtc();
        }
        return modes;
    }

    onclose() {
        if (this.wsState === WebSocket.CLOSED) return false;
        this.wsState = WebSocket.CONNECTING;
        this.ws = null;
        const delay = Math.max(this.RECONNECT_TIMEOUT - (Date.now() - this.connectTS), 0);
        this.reconnectTID = setTimeout(() => {
            this.reconnectTID = 0;
            this.onconnect();
        }, delay);
        return true;
    }

    onmse() {
        let ms;
        if ('ManagedMediaSource' in window) {
            const MediaSource = window.ManagedMediaSource;
            ms = new MediaSource();
            ms.addEventListener('sourceopen', () => {
                this.send({type: 'mse', value: this.codecs(MediaSource.isTypeSupported)});
            }, {once: true});
            this.video.disableRemotePlayback = true;
            this.video.srcObject = ms;
        } else {
            ms = new MediaSource();
            ms.addEventListener('sourceopen', () => {
                URL.revokeObjectURL(this.video.src);
                this.send({type: 'mse', value: this.codecs(MediaSource.isTypeSupported)});
            }, {once: true});
            this.video.src = URL.createObjectURL(ms);
            this.video.srcObject = null;
        }
        this.play();
        this.onmessage['mse'] = msg => {
            if (msg.type !== 'mse') return;
            const sb = ms.addSourceBuffer(msg.value);
            sb.mode = 'segments';
            sb.addEventListener('updateend', () => {
                if (!sb.updating && bufLen > 0) {
                    try {
                        const data = buf.slice(0, bufLen);
                        sb.appendBuffer(data);
                        bufLen = 0;
                    } catch (e) {}
                }
                if (!sb.updating && sb.buffered && sb.buffered.length) {
                    const end = sb.buffered.end(sb.buffered.length - 1);
                    const start = end - 5;
                    const start0 = sb.buffered.start(0);
                    if (start > start0) {
                        sb.remove(start0, start);
                        ms.setLiveSeekableRange(start, end);
                    }
                    if (this.video.currentTime < start) {
                        this.video.currentTime = start;
                    }
                    const gap = end - this.video.currentTime;
                    this.video.playbackRate = gap > 0.1 ? gap : 0.1;
                }
            });
            const buf = new Uint8Array(2 * 1024 * 1024);
            let bufLen = 0;
            this.ondata = data => {
                if (sb.updating || bufLen > 0) {
                    const b = new Uint8Array(data);
                    buf.set(b, bufLen);
                    bufLen += b.byteLength;
                } else {
                    try { sb.appendBuffer(data); } catch (e) {}
                }
            };
        };
    }

    onwebrtc() {
        const pc = new RTCPeerConnection(this.pcConfig);
        pc.addEventListener('icecandidate', ev => {
            const candidate = ev.candidate ? ev.candidate.toJSON().candidate : '';
            this.send({type: 'webrtc/candidate', value: candidate});
        });
        pc.addEventListener('connectionstatechange', () => {
            if (pc.connectionState === 'connected') {
                const tracks = pc.getTransceivers()
                    .filter(tr => tr.currentDirection === 'recvonly')
                    .map(tr => tr.receiver.track);
                const video2 = document.createElement('video');
                video2.addEventListener('loadeddata', () => this.onpcvideo(video2), {once: true});
                video2.srcObject = new MediaStream(tracks);
            } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                pc.close();
                this.pcState = WebSocket.CLOSED;
                this.pc = null;
                this.onconnect();
            }
        });
        this.onmessage['webrtc'] = msg => {
            switch (msg.type) {
                case 'webrtc/candidate':
                    pc.addIceCandidate({candidate: msg.value, sdpMid: '0'}).catch(er => console.warn(er));
                    break;
                case 'webrtc/answer':
                    pc.setRemoteDescription({type: 'answer', sdp: msg.value}).catch(er => console.warn(er));
                    break;
                case 'error':
                    if (!msg.value.includes('webrtc/offer')) return;
                    pc.close();
            }
        };
        this.createOffer(pc).then(offer => {
            this.send({type: 'webrtc/offer', value: offer.sdp});
        });
        this.pcState = WebSocket.CONNECTING;
        this.pc = pc;
    }

    async createOffer(pc) {
        for (const kind of ['video', 'audio']) {
            if (this.media.includes(kind)) {
                pc.addTransceiver(kind, {direction: 'recvonly'});
            }
        }
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        return offer;
    }

    onpcvideo(video2) {
        if (this.pc) {
            this.video.srcObject = video2.srcObject;
            this.play();
            this.pcState = WebSocket.OPEN;
            this.wsState = WebSocket.CLOSED;
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
        }
        video2.srcObject = null;
    }

    onhls() {
        this.onmessage['hls'] = msg => {
            if (msg.type !== 'hls') return;
            const url = 'http' + this.wsURL.substring(2, this.wsURL.indexOf('/ws')) + '/hls/';
            const playlist = msg.value.replace('hls/', url);
            this.video.src = 'data:application/vnd.apple.mpegurl;base64,' + btoa(playlist);
            this.play();
        };
        this.send({type: 'hls', value: this.codecs(type => this.video.canPlayType(type))});
    }
}

/**
 * Pure Video Stream (Clean - No Overlays)
 */
class VideoStream extends VideoRTC {}

customElements.define('video-stream', VideoStream);
