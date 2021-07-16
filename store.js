let data = {
    timestamp: 0,
    objects: [],
    anreise: 0,
    abreise: 0,
    tage: 0,
};

/**
 * updateStore
 *
 * @param {*} newData
 * @returns true, if the objects data changed
 */
export const updateStore = (newData) => {
    let changes = false;

    if (data.objects.length) {
        changes =
            JSON.stringify(data.objects) !== JSON.stringify(newData.objects);
    }

    data = {
        ...data,
        ...newData,
    };

    return changes;
};

export const getStore = () => {
    return data;
};
