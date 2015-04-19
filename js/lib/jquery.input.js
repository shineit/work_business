(function ($) {
    $.fn.beautify = function () {
        this.each(function () {
            var $input = $(this);
            beautify($input);
        });
        return this;
    };
    function beautify($input) {
        if ($input.data("beautified")) {
            return;
        }
        $input.data("beautified", true);
        if ($input.is(':radio')) {
            beautify_radio($input);
        }
        if ($input.is(':checkbox')) {
            beautify_checkbox($input);
        }
    }
    function beautify_radio($input) {
        var $label = $input.closest('label');
        var $form = $label.closest('form');
        var radios = $form.find('input:radio[name="' + $input.attr('name') + '"]');
        var $radios = $(radios);
        $input.on('change', function () {
            $radios.closest('.xm-radio').removeClass('xm-is-checked');
            $label.addClass('xm-is-checked');
        });
       $input.is(':checked') && $input.trigger('change');
    }
    function beautify_checkbox($input) {
        var $label = $input.closest('label');
        $input.on('change', function () {
            $label.toggleClass('xm-is-checked');
        });
        $input.is(':checked') ? $label.addClass('xm-is-checked') : $label.removeClass('xm-is-checked');
    }
})(jQuery);