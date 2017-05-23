﻿var utils = {
    init: function () {
        $.fn.nodoubletapzoom = function () {
            $(this).bind('touchstart', function preventZoom(e) {
                var t2 = e.timeStamp
                  , t1 = $(this).data('lastTouch') || t2
                  , dt = t2 - t1
                  , fingers = e.originalEvent.touches.length;
                $(this).data('lastTouch', t2);
                if (!dt || dt > 500 || fingers > 1) return; // not double-tap

                e.preventDefault(); // double tap - prevent the zoom
                // also synthesize click events we just swallowed up
                $(this).trigger('click').trigger('click');
            });
        };

        angular.module('appConfig', [])
            .constant('config', {
                soundFolder: '/audio/piano/',
                feedbackVisible : true
            });
    },
}

module.exports = {
    init: utils.init
}