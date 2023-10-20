function handlePoolLabel(labels) {
    const poolKeywords = ['swimming pool', 'water', 'waterway', 'watercourse'];

    if (labels.some((label) => poolKeywords.some(keyword => label.toLowerCase().includes(keyword)))) {
        return 'Swimming pool';
    }
    return null;
}

function handleBathLabel(labels) {
    const bathroomKeywords = ['tap', 'plumbing', 'plumbing fixture', 'sink'];

    if (labels.some((label) => bathroomKeywords.some(keyword => label.toLowerCase().includes(keyword)))) {
        return 'Bathroom';
    }
    return null;
}

function handleGymLabel(labels) {
    const gymKeywords = ['exercise machine', 'treadmill', 'sports equipment', 'physical fitness'];

    if (labels.some((label) => gymKeywords.some(keyword => label.toLowerCase().includes(keyword)))) {
        return 'Gym';
    }
    return null;
}

module.exports = {
    handlePoolLabel,
    handleBathLabel,
    handleGymLabel,
    // Export other label handling functions here
};
