// Cloudflare Pages Function. No key is saved; only fixed NanoGPT endpoints are allowed.
export async function onRequest({request}) {
  const path=new URL(request.url).searchParams.get('endpoint');
  const routes={'models?detailed=true':'GET','chat/completions':'POST'};
  if(!Object.prototype.hasOwnProperty.call(routes,path)||request.method!==routes[path]) return new Response('Not found',{status:404});
  const origin=request.headers.get('Origin');
  if(origin&&origin!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
  const auth=request.headers.get('Authorization');
  if(!auth?.startsWith('Bearer '))return new Response('Missing key',{status:401});
  const headers={'Authorization':auth,'Accept':'application/json, text/event-stream'};
  let body;
  if(request.method==='POST'){body=await request.text();if(body.length>8000000)return new Response('Request too large',{status:413});headers['Content-Type']='application/json';}
  try{const upstream=await fetch('https://api.nano-gpt.com/api/v1/'+path,{method:request.method,headers,body,redirect:'error'});return new Response(upstream.body,{status:upstream.status,headers:{'Content-Type':upstream.headers.get('Content-Type')||'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}catch{return new Response(JSON.stringify({error:{message:'NanoGPT connection failed'}}),{status:502,headers:{'Content-Type':'application/json'}})}
}
