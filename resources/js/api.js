// // Function to send updated dragged house coordinates to the server
export async function updateHouseCoordinates(houseId, x, z, rotation) {
    try {
        console.log('Updating house coordinates:', houseId, x, z, rotation);
        const response = await fetch(`/api/house/${houseId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') // Include CSRF token if using Laravel
            },
            body: JSON.stringify({
                id: houseId,
                lat: x,
                lon: z,
                rotation: rotation
            })
        }).then(response => response.json())
        .then(data => {
            console.log('Coordinates updated successfully:', data);
        })
            .catch((error) => {
                console.error('Error:', error);
            });
    } catch (error) {
        console.error('Error updating coordinates:', error);
    }
}
