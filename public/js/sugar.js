(function($){
    $.fn.disable = function() {
        this.attr('disabled', 'disabled');
        return this;
    };
    $.fn.disabled = function() {
        return !!this.attr('disabled');
    };
    $.fn.enable = function() {
        this.removeAttr('disabled');
        return this;
    };
    $.fn.enabled = function() {
        return !this.attr('disabled');
    };
})(jQuery);