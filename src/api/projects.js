import { authFetch } from '../jwt/http'

export async function InsertProject(payload){
  const response = await authFetch('/api/projects/insert',{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return response;
}

export async function GetProjectsByUserId(userId){
  const response = await authFetch(`/api/projects/user/${userId}`,{
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return response;
}