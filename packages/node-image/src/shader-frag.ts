// language=GLSL
const SHADER_SOURCE = /*glsl*/ `
precision highp float;

varying vec4 v_color;
varying vec2 v_diffVector;
varying float v_radius;
varying float v_border;
varying vec4 v_texture;

uniform sampler2D u_atlas;
uniform float u_cameraAngle;
uniform float u_percentagePadding;
uniform bool u_colorizeImages;
uniform bool u_keepWithinCircle;

const vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);

const float radius = 0.5;

void main(void) {
  float dist = length(v_diffVector);
  float border = v_border;
  vec4 color = gl_FragColor;

  float c = cos(-u_cameraAngle);
  float s = sin(-u_cameraAngle);
  vec2 diffVector = mat2(c, s, -s, c) * (v_diffVector);

  // No antialiasing for picking mode:
  #ifdef PICKING_MODE
  border = 0.0;
  color = v_color;

  #else
  // First case: No image to display
  if (v_texture.w <= 0.0) {
    if (!u_colorizeImages) {
      color = v_color;
    }
  }
 
  // Second case: Image loaded into the texture
  else {
    float paddingRatio = 1.0 + 2.0 * u_percentagePadding;
    float coef = u_keepWithinCircle ? 1.0 : ${Math.SQRT2};
    vec2 coordinateInTexture = diffVector * vec2(paddingRatio, -paddingRatio) / v_radius / 2.0 * coef + vec2(0.5, 0.5);
    vec4 texel = texture2D(u_atlas, (v_texture.xy + coordinateInTexture * v_texture.zw), -1.0);

    // Colorize all visible image pixels:
    if (u_colorizeImages) {
      color = mix(gl_FragColor, v_color, texel.a);
    }
 
    // Colorize background pixels, keep image pixel colors:
    else {
      color = vec4(mix(v_color, texel, texel.a).rgb, max(texel.a, v_color.a));
    }

    // Erase pixels "in the padding":
    if (abs(diffVector.x) > v_radius / paddingRatio || abs(diffVector.y) > v_radius / paddingRatio) {
      color = u_colorizeImages ? gl_FragColor : v_color;
    }
  }
  #endif

  // Crop in a circle when u_keepWithinCircle is truthy:
  if (u_keepWithinCircle) {
    if (dist < v_radius - border) {
      gl_FragColor = color;
    } else if (dist < v_radius) {
      gl_FragColor = mix(transparent, color, (v_radius - dist) / border);
    }
  }

  // Crop in a square else:
  else {
    float squareHalfSize = v_radius * ${Math.SQRT1_2 * Math.cos(Math.PI / 12)};
    if (abs(diffVector.x) > squareHalfSize || abs(diffVector.y) > squareHalfSize) {
      gl_FragColor = transparent;
    } else {
      gl_FragColor = color;
    }
  }
}
`;

export default SHADER_SOURCE;
