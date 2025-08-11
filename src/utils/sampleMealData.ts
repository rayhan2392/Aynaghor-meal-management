// Sample meal data to populate the store for testing meal history

export const generateSampleMealData = () => {
    const mealsByDate: Record<string, Record<string, { lunch: boolean; dinner: boolean; guestMeals: number }>> = {};
    const users = ['1', '2', '3', '4', '5']; // User IDs

    // Generate data for the last 10 days
    const today = new Date();
    for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        mealsByDate[dateString] = {};

        users.forEach(userId => {
            // Randomly assign meals with some probability
            const hasLunch = Math.random() > 0.3; // 70% chance of having lunch
            const hasDinner = Math.random() > 0.2; // 80% chance of having dinner
            const guestMeals = Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0; // 20% chance of guest meals

            mealsByDate[dateString][userId] = {
                lunch: hasLunch,
                dinner: hasDinner,
                guestMeals,
            };
        });
    }

    return mealsByDate;
};
