import * as twgl from "twgl.js";
import laserFrag from "./lazer.frag";
import laserVert from "./lazer.vert";
const gl = (document.getElementById("root") as HTMLCanvasElement).getContext(
  "webgl2"
)!;
const programInfo = twgl.createProgramInfo(gl, [laserVert, laserFrag]);
const arrays = {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
};
const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
function render(time: number) {
  twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  const uniforms = {
    iTime: time * 0.001,
    intensity:
      +(document.getElementById("intensity") as HTMLInputElement)?.value ?? 0,
    iResolution: [gl.canvas.width, gl.canvas.height],
  };

  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
