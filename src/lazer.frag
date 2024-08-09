#version 300 es
#define TAU 6.283185307179586
#define GOLDEN 1.618033988749894
precision mediump float;

uniform float iTime;
uniform vec2 iResolution;
out vec4 fragColor;

//--------------------------------------------------------------------------------
//  1 out, 1 in...
#define HASHSCALE .1031
float Hash(float p)
{
    vec3 p3 = fract(vec3(p) * HASHSCALE);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float distToLine(vec2 st, vec2 a, vec2 b)
{
    vec2 ab = b - a;
    vec2 aToST = st - a;
    float t = clamp(dot(ab, aToST) / dot(ab, ab), 0.0, 1.);
    float d = length(a + ab * t - st);

    return d;
}

float getLine(vec2 st, vec2 start, vec2 end)
{
    float jitterIntensity = 0.01;
    float jitter = Hash(sin(iTime * 250.)) * jitterIntensity;

    float f = 0.;
    float dist2Line = distToLine(st, start, end) + jitter;

    f = (0.01 / (dist2Line));
    f += (0.01 / (dist2Line));

    f *= 0.1;

    return clamp(f, 0.0, 1.);
}

mat3 rotX(float d)
{
    return mat3(
        1., 0., 0.,
        0., cos(d), -sin(d),
        0., sin(d), cos(d)
    );
}

mat3 rotY(float d)
{
    return mat3(
        cos(d), 0., sin(d),
        0., 1., 0.,
        -sin(d), 0., cos(d)
    );
}

mat3 rotZ(float d)
{
    return mat3(
        cos(d), -sin(d), 0.,
        sin(d), cos(d), 0,
        0., 0, 1
    );
}

vec2 pToS(vec3 p)
{
    p = p * rotY(iTime * 0.2);
    p = p * rotX(iTime * 0.2);
    p = p * rotZ(iTime * 0.2);

    vec3 pCenter = vec3(-0., 0., 1.0);
    p += pCenter;

    return vec2(p.x / p.z, p.y / p.z);
}

//================================================================================
void main()
{

    //p.x -= mod(p.x, 1.0 / 32.);
    //p.y -= mod(p.y, 1.0 / 32.);
    float pixelSize = max(1., 24. - exp(iTime * 1.5) * 1.5);
    vec2 screenSpace = vec2(gl_FragCoord.x, gl_FragCoord.y);
    vec2 fullUV = screenSpace / iResolution.xy;
    vec2 uv = floor(fullUV * (iResolution / pixelSize)) / iResolution * pixelSize;
    float aspect = iResolution.x / iResolution.y;

    uv.x *= aspect;
    vec2 st = uv;
    st -= vec2(0.50 * aspect, 0.5);

    float f;

    float iTime = iTime * 1.0;

    vec4 color = vec4(0.);

    float scale = 0.09;

    f = 0.;

    vec3[] p = vec3[](
            vec3(1, 1, 1) * scale,
            vec3(-1, 1, 1) * scale,
            vec3(-1, -1, 1) * scale,
            vec3(-1, -1, -1) * scale,

            vec3(-1, 1, -1) * scale,
            vec3(1, -1, -1) * scale,
            vec3(1, -1, 1) * scale,
            vec3(1, 1, -1) * scale,

            vec3(0, GOLDEN, 1. / GOLDEN) * scale,
            vec3(0, -GOLDEN, 1. / GOLDEN) * scale,
            vec3(0, -GOLDEN, -1. / GOLDEN) * scale,
            vec3(0, GOLDEN, -1. / GOLDEN) * scale,

            vec3(GOLDEN, 1. / GOLDEN, 0) * scale,
            vec3(-GOLDEN, 1. / GOLDEN, 0) * scale,
            vec3(-GOLDEN, -1. / GOLDEN, 0) * scale,
            vec3(GOLDEN, -1. / GOLDEN, 0) * scale,

            vec3(1. / GOLDEN, 0, GOLDEN) * scale,
            vec3(1. / GOLDEN, 0, -GOLDEN) * scale,
            vec3(-1. / GOLDEN, 0, GOLDEN) * scale,
            vec3(-1. / GOLDEN, 0, -GOLDEN) * scale
        );

    vec2[40] p_;
    for (int i = 0; i < 40; ++i)
    {
        p_[i] = pToS(p[i]);
    }

    int[] edges = int[](
            0, 8,
            8, 1,
            1, 18,
            18, 16,
            16, 0,

            5, 10,
            10, 3,
            3, 19,
            19, 17,
            17, 5,

            0, 12,
            12, 15,
            15, 6,
            6, 16,

            4, 13,
            13, 14,
            14, 3,
            4, 19,
            2, 18,
            2, 9,
            9, 10,
            2, 14,

            11, 4,
            11, 7,
            7, 12,

            5, 15,
            13, 1,
            11, 8,
            7, 17,
            9, 6

        );

    for (int i = 0; i < edges.length(); i += 2)
    {
        const float jitterIntensity = 0.005;
        const float halfJitter = jitterIntensity * 0.25;
        vec2 randPointA = vec2(Hash(iTime + float(i + 34)), Hash(iTime + float(i + 3424))) * jitterIntensity - halfJitter;
        vec2 randPointB = vec2(Hash(iTime + float(i * 2 + 34)), Hash(iTime + float(i * 24))) * jitterIntensity - halfJitter;

        vec2 pointA = p_[edges[i]] + randPointA;
        vec2 pointB = p_[edges[i + 1]] + randPointB;

        f += getLine(st, pointA, pointB);
    }

    //Color
    //vec3 color = vec3(.05, 1., .1);
    color += vec4(0.3, 0., 0.0, 1.) * f;

    float gamma = 0.25;

    color = vec4(pow(color.x, gamma), pow(color.y, gamma), pow(color.z, gamma), pow(color.x, gamma) * 1.8);

    fragColor = color;
}
