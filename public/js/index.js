$(document).ready(function () {
    var $createGameButton = $('#create-game');
    $createGameButton.click(function (e) {
        if ($createGameButton.disabled()) {
            return;
        }
        $createGameButton.disable();
        ws.emit('game:create');
        setTimeout(function () {
            if ($createGameButton.disabled()) {
                $createGameButton.enable();
            }
        }, 2000);
    });

    ws.on('game:created', function (data) {
        window.location = data.url;
    });
});