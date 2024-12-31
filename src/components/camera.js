export default function CameraSelf({video, canvas}){
    return (
    <>
        <video ref={video}></video>
        <canvas ref={canvas}></canvas>
    </>);
}