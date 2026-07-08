import { useQuery } from '@tanstack/react-query';
import { loadEvents, loadWeeklyEvents } from '@services/api';
import { useMemo } from 'react';

// hook to get all events for calendar
export function useEvents(currentDate: any, includeExcluded = false) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // fetch normal events from api
    const eventsQuery = useQuery<any[]>({
        queryKey: ['events', year, month],
        queryFn: () => loadEvents(month, year),
        staleTime: 300000, // 5 mins in milliseconds
    });

    // fetch weekly templates from api
    const weeklyEventsQuery = useQuery<any[]>({
        queryKey: ['weekly-events'],
        queryFn: () => loadWeeklyEvents(),
        staleTime: 600000, // 10 mins in milliseconds
    });

    // loading and error flags
    const isLoading = eventsQuery.isLoading || weeklyEventsQuery.isLoading;
    const isError = eventsQuery.isError || weeklyEventsQuery.isError;
    const error = eventsQuery.error ?? weeklyEventsQuery.error;

    // combine them here!
    const data = useMemo(() => {
        if (!eventsQuery.data || !weeklyEventsQuery.data) {
            return undefined;
        }

        const list1 = eventsQuery.data;
        const list2 = weeklyEventsQuery.data;

        const finalArray: any[] = [];

        // first copy all normal events
        for (const element of list1) {
            finalArray.push(element);
        }

        // now loop through all weekly events templates
        for (const temp of list2) {
            
            // get start date
            const start = new Date(temp.date.slice(0, 10) + 'T00:00:00');
            if (isNaN(start.getTime())) {
                console.log("bad date found!");
                continue;
            }

            const targetDay = start.getDay(); // 0-6 day of week

            // find how many days in this month
            // trick found on stackoverflow:
            const daysCount = new Date(year, month, 0).getDate();

            // check each day of the month
            for (let d = 1; d <= daysCount; d++) {
                const dayDate = new Date(year, month - 1, d);

                // check if date is after start date and is the same weekday
                if (dayDate.getTime() >= start.getTime()) {
                    if (dayDate.getDay() === targetDay) {
                        // format date string manually
                        const mStr = month < 10 ? "0" + month : "" + month;
                        const dStr = d < 10 ? "0" + d : "" + d;

                        const dateString = year + "-" + mStr + "-" + dStr;

                        // Skip if this specific date is excluded in the recurring template
                        const excludedDates = temp.excludedDates ?? [];
                        const isExcluded = excludedDates.includes(dateString);
                        if (isExcluded && !includeExcluded) {
                            continue;
                        }

                        // create a virtual id so react doesn't crash with duplicate keys
                        const vId = temp.id * 10000000 + (year - 2000) * 10000 + month * 100 + d;

                        const newEvent = {
                            ...temp,
                            id: vId,
                            recurringEventId: temp.id,
                            date: dateString,
                            isRecurring: true,
                            isExcluded: isExcluded
                        };

                        finalArray.push(newEvent);
                    }
                }
            }
        }

        console.log("loaded events count:", finalArray.length);
        return finalArray;
    }, [eventsQuery.data, weeklyEventsQuery.data, year, month, includeExcluded]);

    return {
        data: data,
        isLoading: isLoading,
        isError: isError,
        error: error
    };
}
