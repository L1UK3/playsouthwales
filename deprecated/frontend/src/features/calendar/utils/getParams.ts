export const getParams = () => {
    const isMobile = window.innerWidth < 640;
    return {
        ballDiameter: isMobile ? 24 : 34,
        rightMargin: isMobile ? 4 : 18,
        topMargin: isMobile ? 12 : 22,
        arcHeight: isMobile ? 30 : 46,
        idleAmplitude: isMobile ? 3 : 4,
    };
};
