//digital representation of a board
class Board
{
	//Logical representation of a maze
	#maze;
	// Link to the element where maze will be located
	#main_el;
	#styles;
	constructor(maze)
	{
		this.#maze = maze;
		this.#main_el = document.getElementById("code_area");
		//styles of each cell depending on its type
		this.#styles = {
						"W":"background-color: white;",
						"F": "background-color: black;",
						"E": "background-color: red;",
						"C": "background-color: yellow;",
						"M": "background-color: blue;",
						"N": "background-color: green;"
					};
		this.#initialise();
	}

	// creates a maze in HTML
	#initialise()
	{
		for (let i = 0; i < this.#maze.length; i++)
		{
			// creating a new row
			let new_row = document.createElement("tr");
			for (let j = 0; j < this.#maze[i].length; j++)
			{	
				//creating a new cell
				let new_el = document.createElement("td");
				new_el.style = this.#styles[this.#maze[i][j]];
				new_el.id = this.#create_id(i, j);
				new_row.appendChild(new_el);
			}
			// adding a row to the main table
			this.#main_el.appendChild(new_row);
		}
	}

	//returns the coor of the main character
	get_main()
	{
		for (let i = 0; i < this.#maze.length; i++)
		{
			for (let j = 0; j < this.#maze[i].length; j++)
			{
				if (this.#maze[i][j] == 'M')
				{
					return [i, j];
				}
			}
		}
	}

	//returns number of chocolates
	get_choc()
	{
		let n = 0;
		for (let i = 0; i < this.#maze.length; i++)
		{
			for (let j = 0; j < this.#maze[i].length; j++)
			{
				if (this.#maze[i][j] == 'C')
				{
					n++;
				}
			}
		}
		return n;
	}

	// returns 'the code' of each move
	check_move(x, y)
	{
		if (this.#maze[x][y] == 'F')
		{
			//1 means that the user can move
			return 1;
		}
		if (this.#maze[x][y] == 'C')
		{
			//2 means that they can move and collect the coin
			return 2;
		}
		else if (this.#maze[x][y] == 'E')
		{
			//-1 means they lose
			return -1;
		}
		else if (this.#maze[x][y] == 'N')
		{
			//3 means they won
			return 3;
		}
		else
		{
			//0 means they do not do anything (i.e. try to move into the wall).
			return 0;
		}
	}

	//this function moves the entity
	swap(x, y, x1, y1)
	{
		//logical swap
		let temp = this.#maze[x][y];
		this.#maze[x][y] = this.#maze[x1][y1];
		this.#maze[x1][y1] = temp;

		//swap in styles
		document.getElementById(this.#create_id(x, y)).style = this.#styles[this.#maze[x][y]];
		document.getElementById(this.#create_id(x1, y1)).style = this.#styles[this.#maze[x1][y1]];
	}

	//makes a certain cell free
	make_free(x, y)
	{
		this.#maze[x][y] = 'F';
		document.getElementById(this.#create_id(x, y)).style = this.#styles['F'];
	}

	//creates an id for the cell
	#create_id(i, j)
	{
		return i.toString() + '_' +  j.toString();
	}
}

//class of the Player
class Player
{
	//coordinates of the player
	#x;
	#y;

	constructor(x, y)
	{
		this.#x = x;
		this.#y = y;
	}

	// player movement
	make_move(add_x, add_y)
	{
		this.#x += add_x;
		this.#y += add_y;
	}

	get_x()
	{
		return this.#x;
	}

	get_y()
	{
		return this.#y;
	}
}

//represents the timer of the game
class Timer
{
	#curr_time;
	constructor(curr_time)
	{
		this.#curr_time = curr_time * 1000;
	}

	//general decrease by a number of seconds
	decrease_by(num_of_sec)
	{
		this.#curr_time -= num_of_sec * 1000;
	}

	//returns the time in the needed format
	get_str()
	{
		let curr_time_sec = this.#curr_time / 1000;
		let mins = parseInt(curr_time_sec / 60 );
		let sec = curr_time_sec % 60;
		return mins + ':' + sec;
	}

	//returns time in seconds
	get_time_sec()
	{
		return this.#curr_time / 1000;
	}

	//checks whether 0 seconds left
	is_null()
	{
		console.log(this.#curr_time);
		return this.#curr_time == 0;
	}
}

//This class represents the enemy in the game
class Enemy
{
	#pos_x;
	#pos_y;
	#t_x;
	#t_y;
	#duration;
	#cur_num;
	#id;
	#int_id;
	constructor(pos_x, pos_y, t_x, t_y, duration, id, int_id)
	{
		this.#pos_x = pos_x;
		this.#pos_y = pos_y;
		this.#t_x = t_x;
		this.#t_y = t_y;
		this.#duration = duration;
		this.#id = id;	
		this.#cur_num = 0;
		this.#int_id = int_id
	}

	// makes a movement or changes the trajectory
	make_move()
	{
		this.#pos_x += this.#t_x;
		this.#pos_y += this.#t_y;
		this.#cur_num++;
		//changing trajectory
		if (this.#cur_num == this.#duration)
		{
			this.#cur_num = 0;
			this.#t_x = -this.#t_x;
			this.#t_y = -this.#t_y;
		}
	}

	get_pos_x()
	{
		return this.#pos_x;
	}

	get_pos_y()
	{
		return this.#pos_y;
	}

	//stops the whole movement of the enemy.
	stop_movement()
	{
		clearInterval(this.#int_id);
	}
}

//This class controls the whole game
class Game
{
	#player;
	#board;
	#timer;
	#interval;
	#enemies;
	#paused;
	#system;
	constructor(maze, time)
	{
		this.#board = new Board(maze);
		let main_coor = this.#board.get_main();
		this.#player = new Player(main_coor[0], main_coor[1]);
		this.#timer = new Timer(time);
		this.#paused = false;
		document.getElementById("time").innerHTML = this.#timer.get_str();
		document.getElementById("score").innerHTML = '0/' + this.#board.get_choc();
	}

	//sets the timer id
	set_interval(int)
	{
		this.#interval = int;
	}

	//sets the enemies that are present in the game
	set_enemies(enem)
	{
		this.#enemies = enem;
	}

	//sets the system that controls the transition between screens
	set_system(sys)
	{
		this.#system = sys;
	}

	//changes game from being paused to resumed and vice versa
	change_game_state()
	{
		this.#paused = !this.#paused;
		if (this.#paused)
		{
			document.getElementById("state_b").innerHTML = "Resume";
			document.onkeydown = null;
		}
		else
		{
			document.getElementById("state_b").innerHTML = "Pause";
			document.onkeydown = event_func;
		}
	}

	//makes a decision on the players move
	check_move(add_x, add_y)
	{
		let decision = this.#board.check_move(this.#player.get_x() + add_x, this.#player.get_y() + add_y);
		console.log(this.#player.get_x() + add_x);
		console.log(this.#player.get_y() + add_y);
		if (decision == 1)
		{	
			this.#board.swap(this.#player.get_x(), this.#player.get_y(), this.#player.get_x() + add_x, this.#player.get_y() + add_y);
			this.#player.make_move(add_x, add_y);
			console.log("here");
		}
		else if (decision == 2)
		{
			this.#collect_choc();
			this.#board.make_free(this.#player.get_x() + add_x, this.#player.get_y() + add_y);
			this.#board.swap(this.#player.get_x(), this.#player.get_y(), this.#player.get_x() + add_x, this.#player.get_y() + add_y);
			this.#player.make_move(add_x, add_y);
		}
		else if (decision == 3)
		{
			this.#show_winning_screen();
		}
		else if (decision == -1)
		{
			this.#show_losing_screen();
		}

	}

	//makes enemy's move
	enemy_move(i)
	{
		if (this.#paused)
		{
			return;
		}
		console.log("here");
		let oldx = this.#enemies[i].get_pos_x();
		let oldy = this.#enemies[i].get_pos_y();
		this.#enemies[i].make_move();

		//checks whether there is a player in the new position
		if (this.#player.get_x() == this.#enemies[i].get_pos_x() && this.#player.get_y() == this.#enemies[i].get_pos_y())
		{
			this.#show_losing_screen();
			return;
		}
		this.#board.swap(oldx, oldy, this.#enemies[i].get_pos_x(), this.#enemies[i].get_pos_y());
	}

	//decreases a game timer by a second  
	update_timer()
	{
		if (this.#paused)
		{
			return;
		}
		//console.log(this.timer);
		this.#timer.decrease_by(1);
		document.getElementById("time").innerHTML = this.#timer.get_str();
		if (this.#timer.is_null())
		{
			this.#show_losing_screen();
		}
	}

	//returns and calculates the score of the game
	get_score()
	{
		let coin_score = document.getElementById("score").innerHTML.split('/')[0];
		coin_score *= 100;
		return this.#timer.get_time_sec() + coin_score;
	}

	//stops the game
	#hault_game()
	{
		document.onkeydown = null;
		clearInterval(this.#interval);
		for (let i = 0; i < this.#enemies.length; i++)
		{
			this.#enemies[i].stop_movement();
		}
	}

	//transfers to the "win screen"
	#show_winning_screen()
	{
		this.#hault_game();
		this.#system.to_win_screen(this.get_score());
	}

	//transfers to "losing screen"
	#show_losing_screen()
	{
		this.#hault_game();
		this.#system.to_loose_screen();
	}

	//updates the chocolate counter
	#collect_choc()
	{
		let scores = document.getElementById("score").innerHTML.split('/');
		scores[0]++;
		document.getElementById("score").innerHTML = scores[0] + '/' + scores[1]; 
	}
}

//navigates the user from page to page
class System
{
	#curr_level;
	#margin;
	#score;
	#lvl_length

	constructor(mar, lng)
	{
		this.#margin = mar;
		let search_par = new URLSearchParams(window.location.search);
		this.#score = search_par.get("score");
		this.#curr_level = search_par.get("level");
		this.#lvl_length = lng;
	}

	//moves player to the winning screen
	to_win_screen(score)
	{
		let search_par = new URLSearchParams(window.location.search);

		search_par.set("score", score);
		search_par.set("level", this.#curr_level);
		window.location.href = "winning_screen.html?" + search_par.toString();
	}

	//moves player to the losing screen
	to_loose_screen()
	{
		let search_par = new URLSearchParams(window.location.search);
		search_par.set("level", this.#curr_level);
		window.location.href = "loosing_screen.html?" + search_par.toString();
	}

	//moves the player to the level with the number num
	to_level(num)
	{
		if (num >= this.#lvl_length)
		{
			window.location.href = "final_screen.html";
			return;
		}

		let search_par = new URLSearchParams(window.location.search);
		search_par.set("level", num);
		window.location.href = "game.html?" + search_par.toString();
	}

	//loads the winning screen
	load_win_screen()
	{
		document.getElementById("score").innerHTML = "Your score: " + this.#score;
		if (this.#score >= this.#margin[this.#curr_level])
		{
			document.getElementById("challenge").innerHTML = "Congractulations! You are now eligible for 10% discount!";
		}
		else
		{
			document.getElementById("challenge").innerHTML = "But can you score: " + this.#margin[this.#curr_level] + " to get 10% discount?";
		}
	}

	//returns the number of the current level
	get_curr_level()
	{
		return this.#curr_level;
	}
}
