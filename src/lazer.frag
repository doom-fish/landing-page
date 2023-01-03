#version 300 es
#define PI 3.14159265358979
precision mediump float;

uniform float iTime;
uniform vec2 iResolution;

out vec4 fragColor;

//--------------------------------------------------------------------------------
//  1 out, 1 in...
#define HASHSCALE .1031
float Hash(float p)
{
	vec3 p3  = fract(vec3(p) * HASHSCALE);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}


float distToLine(vec2 st, vec2 a, vec2 b)
{
	vec2 ab = b - a;
    vec2 aToST = st - a;
    float t = clamp(dot(ab, aToST) / dot(ab, ab), 0., 1.);
    float d = length(a + ab * t - st);
    
    //doing some fudging to achieve the falloff line look for vectrex
    //d /= t * 1.;
    
    return d;
}

float getLine(vec2 st, vec2 start, vec2 end)
{
    float jitterIntensity = 0.001;
    float jitter = Hash(sin(iTime * 250.)) * jitterIntensity;
    
    float f = 0.;
    float dist2Line = distToLine(st, start, end) + jitter;
    
    f = (0.01 / (dist2Line));
    
    f *= 0.1;
    
    return clamp(f, 0., 1.);
}

vec3 rotX(vec3 b, float d)
{
    mat3 A = mat3(
        cos(d),	-sin(d), 	0.,
        sin(d), cos(d), 	0.,
        0., 	1., 		0.
        );
    
    vec3 result = (A * b);
    return result;
}

vec3 rotY(vec3 b, float d)
{
    mat3 A = mat3(
        cos(d), 		0., 	sin(d), 
        0., 			1., 	0., 
        -sin(d), 		0., 	cos(d)
        );
    
    vec3 result = (A * b);
    return result;
}

vec3 rotZ(vec3 b, float d)
{
    mat3 A = mat3(
        0., 	1., 		0.,
        0.,		cos(d),		sin(d),
        0.,		-sin(d), 	cos(d)
        );
    
    vec3 result = (A * b);
    return result;
}

vec2 pToS(vec3 p)
{
    p = rotY(p, iTime);
    
    vec3 pCenter = vec3(-0., 0., 1.0);
    p += pCenter;
    
    return vec2(p.x / p.z, p.y / p.z);
}

//================================================================================
void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspect = iResolution.x/iResolution.y;
	uv.x *= aspect;
	vec2 st = uv;
    st -= vec2(0.5 * aspect, 0.5);
    
   
	float f;
    
    float iTime = iTime * 1.0;
    
    vec3 color = vec3(0.);
	
    float deg = iTime * PI * 0.25;
    float halfPI = PI * 0.5;
	f = getLine(st, 
                vec2(0.5, 0.5) + vec2(cos(deg), sin(deg)), 
                vec2(0.5, 0.5) + vec2(cos(deg + PI), sin(deg + PI))
                );
    f = 0.;
    
    
    
    float scale = 0.05 + sin(iTime) * 0.01 + 0.05;
    
    vec3[] p = vec3[](
        (vec3(-scale, -scale, -scale)),
    	(vec3(-scale,  scale, -scale)),
        (vec3( scale,  scale, -scale)),
    	(vec3( scale, -scale, -scale)),
        
        (vec3(-scale, -scale, scale)),
    	(vec3(-scale,  scale, scale)),
     	(vec3( scale,  scale, scale)),
        (vec3( scale, -scale, scale))
    );
    
    vec2[8] p_;
    for (int i = 0 ; i < 8; ++i)
    {
        p_[i] = pToS(p[i]);
    }
    
    const int k_edgeMax = 8 * 3;
    int[] edges = int[](
        0, 1,
        1, 2,
        2, 3,
        3, 0,
        
        4, 5,
        5, 6,
        6, 7,
        7, 4,
        
        //Draw connecting lines
        0, 4,
        1, 5,
        2, 6,
        3, 7
    );
    
    for (int i = 0; i < k_edgeMax; i += 2)
    {
        const float jitterIntensity = 0.003;//pow(sin(iTime), 3.);
        const float halfJitter = jitterIntensity * 0.5;
        vec2 randPointA = vec2(Hash(iTime + float(i + 34)), Hash(iTime + float(i + 3424))) * jitterIntensity - halfJitter;
        vec2 randPointB = vec2(Hash(iTime + float(i * 2 + 34)), Hash(iTime + float(i * 24))) * jitterIntensity - halfJitter;
        
        vec2 pointA = p_[edges[i]] + randPointA;
        vec2 pointB = p_[edges[i + 1]] + randPointB;
        
        f += getLine(st, pointA, pointB);
              
        
    }
    
    //Color
    //vec3 color = vec3(.05, 1., .1);
    color += vec3(0.8, 0., 0.) * f ;
    
    
    
    
    float gamma = 0.59;
    color = vec3(pow(color.x, gamma), pow(color.y, gamma), pow(color.z, gamma));
    
	fragColor = vec4(color, 1.0);
}