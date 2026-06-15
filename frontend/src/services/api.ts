import type { League } from "@/types/League";
import type { Event } from "@/types/Event";

/**
 * Fetches events from the API, optionally filtered by month, year, and leagueId.
 *
 * @param {number} [month] - The month to fetch (1-12).
 * @param {number} [year] - The year to fetch.
 * @param {number} [leagueId] - The ID of the league to fetch events for.
 * @returns {Promise<Event[]>} A promise that resolves to an array of Event objects.
 */
export async function loadEvents(
  month?: number,
  year?: number,
  leagueId?: number,
): Promise<Event[]> {
  try {
    const queryParams = new URLSearchParams();
    if (month !== undefined) queryParams.append("month", String(month));
    if (year !== undefined) queryParams.append("year", String(year));
    if (leagueId !== undefined)
      queryParams.append("leagueId", String(leagueId));

    const response = await fetch(`/api/events?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch events: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

/**
 * Fetches events for a specific league from the API.
 *
 * @param {number} leagueId - The ID of the league to fetch events for.
 * @returns {Promise<Event[]>} A promise that resolves to an array of Event objects.
 */
export async function loadEventsByLeagueId(leagueId: number): Promise<Event[]> {
  try {
    const response = await fetch(`/api/events?leagueId=${leagueId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch events: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

/**
 * Fetches available leagues.
 * @returns {Promise<League[]>} A promise that resolves to an array of League objects.
 */
export async function loadLeagues(): Promise<League[]> {
  try {
    const response = await fetch("/api/leagues");
    if (!response.ok) {
      throw new Error("Failed to fetch leagues: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching leagues:", error);
    throw error;
  }
}

/**
 * Creates a new event.
 * @param {Omit<Event, 'id'>} event - The event data to create.
 * @returns {Promise<Event>} A promise that resolves to the created Event object.
 */
export async function createEvent(event: Omit<Event, "id">): Promise<Event> {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.error ?? "Failed to create event: " + response.statusText,
    );
  }
  return await response.json();
}

/**
 * Updates an existing event.
 * @param {number} id - The ID of the event to update.
 * @param {Partial<Event>} event - The partial event data to update.
 * @returns {Promise<Event>} A promise that resolves to the updated Event object.
 */
export async function updateEvent(
  id: number,
  event: Partial<Event>,
): Promise<Event> {
  const response = await fetch(`/api/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.error ?? "Failed to update event: " + response.statusText,
    );
  }
  return await response.json();
}

/**
 * Deletes an event.
 * @param {number} id - The ID of the event to delete.
 * @returns {Promise<void>} A promise that resolves when the event is successfully deleted.
 */
export async function deleteEvent(id: number): Promise<void> {
  const response = await fetch(`/api/events/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.error ?? "Failed to delete event: " + response.statusText,
    );
  }
}

/**
 * Creates a new league.
 * @param {Omit<League, 'leagueId'>} league - The league data to create.
 * @returns {Promise<League>} A promise that resolves to the created League object.
 */
export async function createLeague(
  league: Omit<League, "leagueId">,
): Promise<League> {
  const response = await fetch("/api/leagues", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(league),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.error?.message ??
      errData.error ??
      "Failed to create league: " + response.statusText,
    );
  }
  return await response.json();
}

/**
 * Updates an existing league.
 * @param {number} id - The ID of the league to update.
 * @param {Partial<League>} league - The partial league data to update.
 * @returns {Promise<League>} A promise that resolves to the updated League object.
 */
export async function updateLeague(
  id: number,
  league: Partial<League>,
): Promise<League> {
  const response = await fetch(`/api/leagues/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(league),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.error?.message ??
      errData.error ??
      "Failed to update league: " + response.statusText,
    );
  }
  return await response.json();
}

/**
 * Deletes a league.
 * @param {number} id - The ID of the league to delete.
 * @returns {Promise<void>} A promise that resolves when the league is successfully deleted.
 */
export async function deleteLeague(id: number): Promise<void> {
  const response = await fetch(`/api/leagues/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.error?.message ??
      errData.error ??
      "Failed to delete league: " + response.statusText,
    );
  }
}

/**
 * Fetches the top 20 players in Wales from the API.
 * @returns {Promise<any[]>} A promise that resolves to an array of top 20 player objects.
 */
export async function loadTop20Players(): Promise<any[]> {
  try {
    const response = await fetch("/api/players/top20");
    if (!response.ok) {
      throw new Error("Failed to fetch top 20 players: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching top 20 players:", error);
    throw error;
  }
}


/**
 * Fetches the local leaderboard for a specific league from the API.
 * @param {number} leagueId - The ID of the league for which to fetch the leaderboard.
 * @returns {Promise<any[]>} A promise that resolves to an array of leaderboard entries.
 */
export async function loadLocalLeaderboard(leagueId: number): Promise<any[]> {
  try {
    const response = await fetch(`/api/leaderboard/${leagueId}`);
    if (!response.ok) {
      throw new Error(
        "Failed to fetch local leaderboard: " + response.statusText,
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching local leaderboard:", error);
    throw error;
  }
}
