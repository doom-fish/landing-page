#version 300 es
#define TAU 6.283185307179586
#define GOLDEN 1.618033988749894
precision mediump float;

uniform float iTime;
uniform float intensity;
uniform vec2 iResolution;

out vec4 fragColor;

mat2 rotate2d(float angle){
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle));
}

float variation1(vec2 v1, vec2 v2, float strength, float speed) {
	return cos(
        dot(normalize(v1), normalize(v2)) * strength + iTime * speed
    ) / 100.0;
}
float variation2(vec2 v1, vec2 v2, float strength, float speed) {
	return sin(
        dot(normalize(v1), normalize(v2)) * strength + iTime * speed
    ) / 100.0;
}
float distToLine(vec2 st, vec2 a, vec2 b)
{
	vec2 ab = b - a;
    vec2 aToST = st - a;
    float t = clamp(dot(ab, aToST) / dot(ab, ab), 0., 1.);
    float d = length(a + ab * t - st);
    
    
    return d;
}

float getLine(vec2 st, vec2 start, vec2 end)
{
    
    float f = 0.;
    float dist2Line = distToLine(st, start, end) ;
    
    f = (0.01 / (dist2Line)) ;
    
    f *= 0.1;
    
    return clamp(f, 0., 1.);
}

float sdTriangle( in vec2 p, in vec2 p0, in vec2 p1, in vec2 p2 )
{
	vec2 e0 = p1 - p0;
	vec2 e1 = p2 - p1;
	vec2 e2 = p0 - p2;

	vec2 v0 = p - p0;
	vec2 v1 = p - p1;
	vec2 v2 = p - p2;

	vec2 pq0 = v0 - e0*clamp( dot(v0,e0)/dot(e0,e0), 0.0, 1.0 );
	vec2 pq1 = v1 - e1*clamp( dot(v1,e1)/dot(e1,e1), 0.0, 1.0 );
	vec2 pq2 = v2 - e2*clamp( dot(v2,e2)/dot(e2,e2), 0.0, 1.0 );
    
    float s = e0.x*e2.y - e0.y*e2.x;
    vec2 d = min( min( vec2( dot( pq0, pq0 ), s*(v0.x*e0.y-v0.y*e0.x) ),
                       vec2( dot( pq1, pq1 ), s*(v1.x*e1.y-v1.y*e1.x) )),
                       vec2( dot( pq2, pq2 ), s*(v2.x*e2.y-v2.y*e2.x) ));

	return -sqrt(d.x)*sign(d.y);
}
float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

vec3 paintCircle (vec2 uv, vec2 center, float rad, float width) {
    
    vec2 diff = center-uv;
    float scale = 0.5;
    vec2 triOffset = vec2(0.4,0.5);
    vec2 circleOffset = vec2(-0.13,0.);
    float tri = sdTriangle(uv, center *triOffset + vec2(0.0, 0.0) * scale, center * triOffset +  vec2(0.0, 1.0) * scale, center * triOffset + vec2(0.8, 0.5) * scale);
    float circle = sdCircle(circleOffset +diff, 0.2);

    tri += variation2(diff, vec2(1.0, 0.0), 5.0, 2.0) *  intensity * 0.5;
    tri -= variation2(diff, vec2(0.0, 1.0), 5.0, 2.0) * intensity*0.5;
    circle += variation2(circleOffset+ diff, vec2(1.0, 0.0), 5.0, 2.0) *  intensity*0.5;
    circle -= variation2(circleOffset+diff, vec2(0.0, 1.0), 5.0, 2.0) * intensity*0.5;
    
    float dist = mix(tri, circle, intensity*0.3);
    // float dist = tri;
    
    float result = smoothstep(rad - width, rad, dist) - smoothstep(rad, rad + width, dist);
    
    return vec3(result);
}


void main( )
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    // uv.x -= 0.40;
    
    
    
    
    vec3 color;
    float radius = 0.001;
    vec2 center = vec2(0.5);
    

    
     
    //paint color circle
    color = paintCircle(uv, center, radius  , 0.05);
     
    //color with gradient
    
    
    //paint white circle
    color += paintCircle(uv, center, radius , 0.005);
    color *= vec3(0., 0.5, 0.);
    
    
	fragColor = vec4(color, 1.0);
}
