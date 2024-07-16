const newComment = async (event) => {
    event.preventDefault();
    const comment = document.querySelector('#comment').value.trim();
    if (comment) {
        const response = await axios.post('/api/users/comment', {comment});
        if (response.status === 200) {
            document.location.reload();
            console.log('New comment created');
        } else {
            alert('Failed to create new comment');
        }
    }
};

document
    .querySelector('#commentBtn')
    .addEventListener('click', newComment);