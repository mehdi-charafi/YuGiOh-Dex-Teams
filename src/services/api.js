 const BASE_URL = 'http://localhost:5000';

export async function request(method = 'GET', route = '', body = null) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${route}`, options);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: Fetch failed`);
    }

    if (method === 'DELETE') {
      return true;
    }

    return await response.json();
    
  } catch (error) {
    console.error("API Request Error:", error);
    throw error; 
  }
}
 
    export function getCreatures() {
      return request(`GET`, `/creatures`)
    }

    export function getCreaturesByType(type) {
      return request(`GET`, `/creatures?type=${encodeURIComponent(type)}`)
    }

    export function searchCreatures(query) {
      query = query.trim()
      return request(`GET`, `/creatures?name=${encodeURIComponent(query)}`)
    }

    export function searchCreaturesByTypeAndQuery(type, query) {
      return request(`GET`, `/creatures?type=${encodeURIComponent(type)}&name=${encodeURIComponent(query)}`)
    }

    export function createCreature(card) {
     request(`POST`, '/creatures', card)
     return
    }

    export function getTeam() {
      return request(`GET`, `/equip`)
    }

    export function addToTeam(card) {
      request(`POST`, `/equip`, card)
      return
    }
    
    export function removeFromTeam(index) {
      request(`DELETE`, `/equip/${index}`)
      return
    }
