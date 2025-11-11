const board = document.querySelector(".chessboard");
const total_board = document.querySelector(".total_board");
let BlackCasting = true;
let WhiteCasting = true;
let Casting = false;
const initialSetup = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];
for (var i = 0; i < 8; i++) {
  for (var j = 0; j < 8; j++) {
    let square = document.createElement("div");
    if (i % 2 !== j % 2) square.classList.add("black");
    else square.classList.add("white");
    square.textContent = initialSetup[i][j];
    square.dataset.row = i;
    square.dataset.col = j;
    board.appendChild(square);
  }
}
const prev = new Array();
const prev_check_pos = new Array();
const prev_pos = [];
const black_coins = ["♜", "♞", "♝", "♛", "♚", "♟"];
let move_count = 0;
isSwaping = false;
const allElement = document.querySelectorAll(".chessboard div");
const map_function = new Map([
  ["♟", pawn_possible_move],
  ["♙", pawn_possible_move],
  ["♞", horse_possible_move],
  ["♘", horse_possible_move],
  ["♜", elephant_possible_move],
  ["♖", elephant_possible_move],
  ["♝", bishop_possible_move],
  ["♗", bishop_possible_move],
  ["♔", king_possible_move],
  ["♚", king_possible_move],
  ["♛", queen_possible_move],
  ["♕", queen_possible_move],
]);

allElement.forEach((Element) => {
  Element.addEventListener("click", () => {
    let isClicked = false;
    Casting = false;
    if (prev.length) {
      retrievColor(prev.pop());
    }
    while (prev_check_pos.length) {
      retrievColor(prev_check_pos.pop());
    }
    while (prev.length) {
      let p = prev.pop();
      if (p === Element) isClicked = true;
      retrievColor(p);
    }
    let row = parseInt(Element.dataset.row);
    let col = parseInt(Element.dataset.col);
    let val = initialSetup[row][col];
    if (
      Element.textContent !== "" &&
      !isClicked &&
      black_coins.includes(val) === (move_count % 2 !== 0)
    ) {
      tilt(Element);
      //call the function to make a move
      map_function.get(val)(row, col, false, false);

      prev.push(Element);
      prev_pos[0] = row;
      prev_pos[1] = col;
    }
    if (isClicked) {
      move_coin(prev_pos[0], prev_pos[1], row, col);
      let piece = initialSetup[row][col];
      let isblack = black_coins.includes(piece);
      let cast = (isblack) ? BlackCasting : WhiteCasting;
      if((piece === "♚" || piece === "♔") && col === 6 && cast){
        move_coin(row , 7 , row , 5);
      }
      if ((piece === "♟" && row === 7) || (piece === "♙" && row === 0)) {
        show_change_option(row, col, isblack);
      }
      let check_for_opponent = checking_check_pos(!isblack);
      if (check_for_opponent) {
        let isCheckMate = find_check_mate(!isblack);
        if (isCheckMate) {
          if (isblack) {
            alert("Black Won The Match");
          } else {
            alert("White Won The Match");
          }
        }
      }
      removeCasting(piece, prev[0], prev[1], isblack);

      move_count++;
      update_coin();
    }
  });
});

//To track pawn Move
function pawn_possible_move(row, col, isChecking, isCheckMate) {
  let isblack = initialSetup[row][col] === "♟" ? true : false;
  let sign = 1;
  let start = 1;

  if (!isblack) {
    sign = -1;
    start = 6;
  }
  let pos1 = [row + sign * 1, col];
  let pos2 = [row + sign * 2, col];
  let pos3 = [row + sign * 1, col + 1];
  let pos4 = [row + sign * 1, col - 1];
  let Check = false;
  if (isValid_position(pos1[0], pos1[1])) {
    let piece = initialSetup[pos1[0]][pos1[1]];
    if (piece === "" && !isChecking) {
      let element = document.querySelector(
        `[data-row = "${pos1[0]}"][data-col = "${pos1[1]}"]`
      );

      move_coin(row, col, pos1[0], pos1[1]);
      let isCheck_pos = checking_check_pos(isblack);
      move_coin(pos1[0], pos1[1], row, col);

      if (!isCheck_pos) {
        if (!isCheckMate) {
          highlight(element);
          prev.push(element);
        } else {
          return false;
        }
      }

      if (
        row === start &&
        isValid_position(pos2[0], pos2[1]) &&
        initialSetup[pos2[0]][pos2[1]] === ""
      ) {
        let element = document.querySelector(
          `[data-row = "${pos2[0]}"][data-col = "${pos2[1]}"]`
        );
        move_coin(row, col, pos2[0], pos2[1]);
        let isCheck_pos = checking_check_pos(isblack);
        move_coin(pos2[0], pos2[1], row, col);
        if (!isCheck_pos) {
          if (!isCheckMate) {
            highlight(element);
            prev.push(element);
          } else {
            return false;
          }
        }
      }
    }
  }
  if (isValid_position(pos3[0], pos3[1])) {
    let piece = initialSetup[pos3[0]][pos3[1]];
    if (
      isFight_position(pos3[0], pos3[1], isblack, black_coins.includes(piece))
    ) {
      if (!isChecking) {
        let element = document.querySelector(
          `[data-row = "${pos3[0]}"][data-col = "${pos3[1]}"]`
        );
        move_coin(row, col, pos3[0], pos3[1]);
        let isCheck_pos = checking_check_pos(isblack);
        move_coin_back(pos3[0], pos3[1], row, col, piece);
        if (!isCheck_pos) {
          if (!isCheckMate) {
            coin_kill_highlight(element);
            prev.push(element);
          } else {
            return false;
          }
        }
      }
      if (piece === "♔" || piece === "♚") {
        Check = Check || isCheck(piece, isblack);
      }
    }
  }
  if (isValid_position(pos4[0], pos4[1])) {
    let piece = initialSetup[pos4[0]][pos4[1]];
    if (
      isFight_position(pos4[0], pos4[1], isblack, black_coins.includes(piece))
    ) {
      if (!isChecking) {
        let element = document.querySelector(
          `[data-row = "${pos4[0]}"][data-col = "${pos4[1]}"]`
        );
        move_coin(row, col, pos4[0], pos4[1]);
        let isCheck_pos = checking_check_pos(isblack);
        move_coin_back(pos4[0], pos4[1], row, col, piece);
        if (!isCheck_pos) {
          if (!isCheckMate) {
            coin_kill_highlight(element);
            prev.push(element);
          } else {
            return false;
          }
        }
      }
      if (piece === "♔" || piece === "♚") {
        Check = Check || isCheck(piece, isblack);
      }
    }
  }
  if (isCheckMate) return true;
  return Check;
}

//to track Horse Move
function horse_possible_move(row, col, isChecking, isCheckMate) {
  let direction = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];
  let isblack = black_coins.includes(initialSetup[row][col]);
  let Check = false;
  for (let [dr, dc] of direction) {
    let r = row + dr;
    let c = col + dc;
    if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
      let piece = initialSetup[r][c];
      let temp = document.querySelector(
        `[data-row = "${r}"][data-col = "${c}"]`
      );
      if (piece === "") {
        if (!isChecking) {
          move_coin(row, col, r, c);
          let isCheck_pos = checking_check_pos(isblack);
          move_coin(r, c, row, col);
          if (!isCheck_pos) {
            if (!isCheckMate) {
              highlight(temp);
              prev.push(temp);
            } else {
              return false;
            }
          }
        }
      } else if (isblack !== black_coins.includes(piece)) {
        if (!isChecking) {
          move_coin(row, col, r, c);
          let isCheck_pos = checking_check_pos(isblack);
          move_coin_back(r, c, row, col, piece);
          if (!isCheck_pos) {
            if (!isCheckMate) {
              coin_kill_highlight(temp);
              prev.push(temp);
            } else {
              return false;
            }
          }
        }
        if (piece === "♔" || piece === "♚") {
          Check = Check || isCheck(piece, isblack);
        }
      }
    }
  }

  if (isCheckMate) return true;
  return Check;
}

//To track Bishop Move
function bishop_possible_move(row, col, isChecking, isCheckMate) {
  let isblack = black_coins.includes(initialSetup[row][col]);
  let direction = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  let Check = false;
  for (let [dr, dc] of direction) {
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r <= 7 && c <= 7 && c >= 0) {
      let piece = initialSetup[r][c];
      let temp = document.querySelector(
        `[data-row = "${r}"][data-col = "${c}"]`
      );
      if (piece === "") {
        if (!isChecking) {
          move_coin(row, col, r, c);
          let isCheck_pos = checking_check_pos(isblack);
          move_coin(r, c, row, col);
          if (!isCheck_pos) {
            if (!isCheckMate) {
              highlight(temp);
              prev.push(temp);
            } else {
              return false;
            }
          }
        }
      } else {
        if (isblack !== black_coins.includes(piece)) {
          if (!isChecking) {
            move_coin(row, col, r, c);
            let isCheck_pos = checking_check_pos(isblack);
            move_coin_back(r, c, row, col, piece);
            if (!isCheck_pos) {
              if (!isCheckMate) {
                coin_kill_highlight(temp);
                prev.push(temp);
              } else {
                return false;
              }
            }
          }
        }
        if (piece === "♔" || piece === "♚") {
          Check = Check || isCheck(piece, isblack);
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }
  if (isCheckMate) return true;
  return Check;
}

//To track Kings Move
function king_possible_move(row, col, isChecking, isCheckMate) {
  let isblack = initialSetup[row][col] === "♚";
  let direction = [
    [-1, 0],
    [-1, -1],
    [1, 0],
    [1, 1],
    [-1, 1],
    [1, -1],
    [0, -1],
    [0, 1],
  ];
  let Check = false;
  for (let [dr, dc] of direction) {
    let r = row + dr;
    let c = col + dc;
    if (r >= 0 && r <= 7 && c <= 7 && c >= 0) {
      let piece = initialSetup[r][c];
      let temp = document.querySelector(
        `[data-row = "${r}"][data-col = "${c}"]`
      );
      if (piece === "") {
        if (!isChecking) {
          move_coin(row, col, r, c);
          let isCheck_pos = checking_check_pos(isblack);
          move_coin(r, c, row, col);
          if (!isCheck_pos) {
            if (!isCheckMate) {
              highlight(temp);
              prev.push(temp);
            } else {
              return false;
            }
          }
        }
      } 
      else if (isblack !== black_coins.includes(piece)) {
        if (!isChecking) {
          move_coin(row, col, r, c);
          let isCheck_pos = checking_check_pos(isblack);
          move_coin_back(r, c, row, col, piece);
          if (!isCheck_pos) {
            if (!isCheckMate) {
              coin_kill_highlight(temp);
              prev.push(temp);
            } else {
              return false;
            }
          }
        }
        if (piece === "♔" || piece === "♚") {
          Check = Check || isCheck(piece, isblack);
        }
      }
    }
  }
  
  if(!isCheckMate && !isChecking){
    casting(row , col , isblack);
  }
  if (isCheckMate) return true;
  return Check;
}

//To track Queens Move
function queen_possible_move(row, col, isChecking, isCheckMate) {
  let Check = false;
  Check = Check || elephant_possible_move(row, col, isChecking, isCheckMate);
  Check = Check || bishop_possible_move(row, col, isChecking, isCheckMate);
  if (isCheckMate) return true;
  return Check;
}

//To track Elephants Move
function elephant_possible_move(row, col, isChecking, isCheckMate) {
  let isblack = black_coins.includes(initialSetup[row][col]);
  let direction = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  let Check = false;
  for (let [dr, dc] of direction) {
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r <= 7 && c <= 7 && c >= 0) {
      let piece = initialSetup[r][c];
      let temp = document.querySelector(
        `[data-row = "${r}"][data-col = "${c}"]`
      );

      if (piece === "") {
        if (!isChecking) {
          move_coin(row, col, r, c);
          let isCheck_pos = checking_check_pos(isblack);
          move_coin(r, c, row, col);
          if (!isCheck_pos) {
            if (!isCheckMate) {
              highlight(temp);
              prev.push(temp);
            } else {
              return false;
            }
          }
        }
      } else {
        if (isblack !== black_coins.includes(piece)) {
          if (!isChecking) {
            move_coin(row, col, r, c);
            let isCheck_pos = checking_check_pos(isblack);
            move_coin_back(r, c, row, col, piece);
            if (!isCheck_pos) {
              if (!isCheckMate) {
                coin_kill_highlight(temp);
                prev.push(temp);
              } else {
                return false;
              }
            }
          }
          if (piece === "♔" || piece === "♚") {
            Check = Check || isCheck(piece, isblack);
          }
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }
  if (isCheckMate) return true;
  return Check;
}

//Check for a King

function move_coin(row1, col1, row2, col2) {
  initialSetup[row2][col2] = initialSetup[row1][col1];
  initialSetup[row1][col1] = "";
}
function move_coin_back(row1, col1, row2, col2, temp) {
  initialSetup[row2][col2] = initialSetup[row1][col1];
  initialSetup[row1][col1] = temp;
}
function isValid_position(row, col) {
  if (row >= 0 && row <= 7 && col >= 0 && col <= 7) {
    return true;
  }
  return false;
}

function isFight_position(row, col, isblack, isopponentBlack) {
  if (initialSetup[row][col] !== "" && isblack !== isopponentBlack) {
    return true;
  }
  return false;
}

function checking_check_pos(isblack) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let piece = initialSetup[i][j];
      if (isblack !== black_coins.includes(piece) && piece !== "") {
        let temp = document.querySelector(
          `[data-row = "${i}"][data-col = "${j}"]`
        );
        let check = map_function.get(piece)(i, j, true, false);
        if (check) {
          check_highlight(temp);
          prev_check_pos.push(temp);
          return true;
        }
      }
    }
  }
  return false;
}
function isCheck(piece, isblack) {
  if (isblack !== black_coins.includes(piece)) {
    return true;
  }
  return false;
}

function find_check_mate(isblack) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let piece = initialSetup[i][j];
      if (isblack === black_coins.includes(piece) && piece !== "") {
        let check_mate = map_function.get(piece)(i, j, false, true);
        if (!check_mate) {
          return false;
        }
      }
    }
  }
  return true;
}

function show_change_option(row, col, isblack) {
  let swap;
  if (isblack) {
    swap = document.querySelector(".black_swap");
  } else {
    swap = document.querySelector(".white_swap");
  }
  total_board.style.marginTop = "15vh";
  swap.style.display = "flex";
  total_board.style.opacity = "0.7";
  let swap_img = swap.children;
  let temp = document.querySelector(`[data-row = "${row}"][data-col = "${col}"]`);
  for (let child of swap_img) {
    let element = child.querySelector("img");
    element.addEventListener("click", () => {
      let piece = element.dataset.value;
      initialSetup[row][col] = piece;
      temp.textContent = piece;
      total_board.style.marginTop = "5vh";
      swap.style.display = "none";
      total_board.style.opacity = "1";
    });
  }
}
function update_coin() {
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      let temp = document.querySelector(
        `[data-row = "${i}"][data-col = "${j}"]`
      );
      temp.textContent = initialSetup[i][j];
    }
  }
}

function casting(row, col, isblack) {
  let is_in_initial_pos = (isblack) ? BlackCasting : WhiteCasting;
  
  if (is_in_initial_pos) {
    let king = initialSetup[row][col];
    let rook = initialSetup[row][7];
    let check = checking_check_pos(isblack);
    col++;
    while (col < 7 && initialSetup[row][col] === "" && !check) {
      move_coin(row, col - 1, row, col);
      check = checking_check_pos(isblack);
      col++;
    }
    if(col > 5)
      move_coin(row , col - 1 , row , 4);
    if (!check && col === 7) {
      initialSetup[row][4] = king;
      initialSetup[row][7] = rook;
      let pos2 = document.querySelector(`[data-row = "${row}"][data-col = "${6}"]`);
      highlight(pos2);
      prev.push(pos2);
    }

  }
}
function removeCasting(piece, row, col, isblack) {
  if (!BlackCasting && !WhiteCasting) return;
  if (piece === "♚" || piece === "♔") {
    if (isblack) {
      BlackCasting = false;
    }
    else {
      WhiteCasting = false;
    }
  }
  if (isblack && row === 7 && col === 7) {
    BlackCasting = false;
  }
  else if (!isblack && row == 0 && col === 0) {
    WhiteCasting = false;
  }

}
function highlight(element) {
  let high = document.createElement("div");
  high.classList = "highlight";
  element.appendChild(high);
}

function tilt(element) {
  element.style.fontSize = "10vmin";
}
function coin_kill_highlight(element) {
  element.style.backgroundColor = "brown";
}
function check_highlight(element) {
  element.style.backgroundColor = "red";
}
function retrievColor(element) {
  element.style.backgroundColor = "";
  element.style.fontSize = "7.5vmin";
  let high = element.querySelector(".highlight");
  if (high) element.removeChild(high);
}