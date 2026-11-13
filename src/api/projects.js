export async function InsertProject(payload){
  const response = await fetch('/api/projects/insert',{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return response;
}

export async function GetProjectsByUserId(userId){
  const response = await fetch(`/api/projects/user/${userId}`,{
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return response;
}