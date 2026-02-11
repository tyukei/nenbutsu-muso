// ==========================================
// events.js — 簡易イベントバス
// ==========================================

const EventBus = {
    _listeners: {},

    /**
     * イベントリスナーを登録
     * @param {string} event - イベント名
     * @param {Function} fn - コールバック関数
     */
    on(event, fn) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(fn);
    },

    /**
     * イベントリスナーを解除
     * @param {string} event - イベント名
     * @param {Function} fn - コールバック関数
     */
    off(event, fn) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    },

    /**
     * イベントを発火
     * @param {string} event - イベント名
     * @param {*} data - イベントデータ
     */
    emit(event, data) {
        if (!this._listeners[event]) return;
        this._listeners[event].forEach(fn => fn(data));
    }
};
