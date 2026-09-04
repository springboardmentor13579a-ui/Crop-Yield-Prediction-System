const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function getToken(){ return localStorage.getItem('yieldsense_token') }
export function getStoredUser(){ try{return JSON.parse(localStorage.getItem('yieldsense_user')||'null')}catch{return null} }
export function saveAuth(data){ localStorage.setItem('yieldsense_token',data.access_token); localStorage.setItem('yieldsense_user',JSON.stringify(data.user)) }
export function updateStoredUser(user){ localStorage.setItem('yieldsense_user',JSON.stringify(user)) }
export function clearAuth(){ localStorage.removeItem('yieldsense_token'); localStorage.removeItem('yieldsense_user') }

export async function api(path, options={}){
  const headers={...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})}
  const token=getToken(); if(token) headers.Authorization=`Bearer ${token}`
  const response=await fetch(`${API_URL}${path}`,{...options,headers})
  const text=await response.text(); let data=null
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!response.ok){
    const detail=data?.detail
    const message=Array.isArray(detail)?detail.map(x=>x.msg).join(', '):detail||data?.message||`Request failed (${response.status})`
    throw new Error(message)
  }
  return data
}
