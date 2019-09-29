var MusicManager = cc.Class({
    extends: cc.Component,

    properties: {
        backgroundAudio: cc.AudioSource,
        sfxAudio: cc.AudioSource,
        backgroundAudioClip: [cc.AudioClip],
        sfxAudioClips: [cc.AudioClip],
    },

    statics: {
        instance: null,
    },

    onLoad: function () {
        MusicManager.instance = this;
        this.playBackgroundAudio(0);
    },

    playBackgroundAudio: function (index) {
        if (this.backgroundAudio.clip != this.backgroundAudioClip[index]) {
            this.backgroundAudio.clip = this.backgroundAudioClip[index];
            this.backgroundAudio.play();
            this.backgroundAudio.loop = true;
        }
    },

    playBackgroundAudioOnce: function (index) {
        if (this.backgroundAudio.clip != this.backgroundAudioClip[index]) {
            this.backgroundAudio.clip = this.backgroundAudioClip[index];
            this.backgroundAudio.play();
            this.backgroundAudio.loop = false;
        }
    },

    playSfxAudio: function (index) {
        this.sfxAudio.clip = this.sfxAudioClips[index];
        this.sfxAudio.play();
        this.sfxAudio.loop = false;
    },
});
