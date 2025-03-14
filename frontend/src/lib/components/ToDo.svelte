<script>
	//@ts-nocheck
	export let tasks = [];

	let newTask = '';

	function addTask() {
		if (newTask.trim()) {
			tasks = [...tasks, { id: Date.now(), text: newTask, completed: false }];
			newTask = '';
		}
	}

	function toggleTask(id) {
		tasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
	}

	function removeTask(id) {
		tasks = tasks.filter((task) => task.id !== id);
	}
</script>

<div class="mx-auto max-w-md rounded-lg bg-white p-4 shadow-lg">
	<h2 class="mb-4 text-xl font-bold">To-Do List</h2>

	<div class="flex gap-2">
		<input
			type="text"
			bind:value={newTask}
			placeholder="Add a new task..."
			class="w-full rounded-lg border p-2"
			on:keydown={(e) => e.key === 'Enter' && addTask()}
		/>
		<button on:click={addTask} class="rounded-lg bg-blue-500 px-4 py-2 text-white">Add</button>
	</div>

	<ul class="mt-4">
		{#each tasks as task, i}
			<li class="flex items-center justify-between border-b p-2">
				<span
					class="cursor-pointer {task.completed ? 'text-gray-500 line-through' : ''}"
					on:click={() => toggleTask(task.id)}
				>
					{task.text}
				</span>
				<button on:click={() => removeTask(task.id)} class="text-red-500">✖</button>
			</li>
		{/each}
	</ul>
</div>
