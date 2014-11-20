var asciify = require('asciify');

function videoascii(options){
    var canvas = options.canvas;
    var ctx = canvas.getContext('2d');
    var video = options.video;
    var output_width = options.output_width;
    var autoplay = (options.autoplay === undefined) ? false : options.autoplay;
    var font_size = (options.font_size === undefined) ? 12 : options.font_size;
    var monochrome = (options.monochrome === undefined) ? true : options.monochrome;

    var width, height, image_data, aspect_ratio, output_height;

    // Video frames are drawn to offscreen buffer canvas
    // in order to get pixel data into ImageData array.
    var buffer_canvas = document.createElement('canvas');
    var buffer_ctx = buffer_canvas.getContext('2d');


    video.addEventListener('loadeddata', function(){
        // Setting width/height resets the context, so these go first.
        width = Math.floor(video.videoWidth);
        height = Math.floor(video.videoHeight);
        buffer_canvas.width = width;
        buffer_canvas.height = height;

        aspect_ratio = width / height;
        // Set output canvas to same aspect ratio as video
        // If no output width is specified, output canvas will
        // be same size as video.
        output_width = (output_width === undefined) ? width : output_width;
        output_height = Math.floor(output_width / aspect_ratio);
        canvas.width = output_width;
        canvas.height = output_height;

        ctx.font = font_size + "pt Courier";
       
        image_data = buffer_ctx.getImageData(0, 0, width, height);

        if (autoplay){
            video.play();
        }
        window.requestAnimationFrame(update);
    });


    function update(){
        if (video.paused || video.ended){
            window.requestAnimationFrame(update);
            return;
        }
        buffer_ctx.drawImage(video, 0, 0);
        image_data = buffer_ctx.getImageData(0, 0, width, height);
        ctx.clearRect(0, 0, output_width, output_height);
        asciify(image_data, canvas, font_size, monochrome);
        window.requestAnimationFrame(update);
    }
}

module.exports = videoascii;