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

<div class="mx-auto max-w-md p-4">
	<h2 class="mb-4 text-lg font-medium text-gray-800">To-Do List</h2>

	<div class="mb-4 flex gap-2">
		<input
			type="text"
			bind:value={newTask}
			placeholder="Add a new task..."
			class="flex-1 border-b border-gray-300 p-2 focus:border-gray-500 focus:outline-none"
			on:keydown={(e) => e.key === 'Enter' && addTask()}
		/>
		<button
			on:click={addTask}
			class="px-3 py-2 text-gray-500 transition-colors hover:text-gray-700"
		>
			+
		</button>
	</div>

	<ul class="space-y-1">
		{#each tasks as task, i}
			<li class="flex items-center justify-between py-1">
				<span
					class="cursor-pointer text-gray-700 {task.completed ? 'text-gray-400 line-through' : ''}"
					on:click={() => toggleTask(task.id)}
					on:keydown={(e) => e.key === 'Enter' && toggleTask(task.id)}
					tabindex="0"
					role="button"
				>
					{task.text}
				</span>
				<button
					on:click={() => removeTask(task.id)}
					class="text-sm text-gray-400 transition-colors hover:text-gray-600"
				>
					×
				</button>
			</li>
		{/each}
	</ul>
</div>
