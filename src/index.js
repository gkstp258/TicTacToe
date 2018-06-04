import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) { //이긴 칸 배경색깔
  const winningSquareStyle = {
    backgroundColor: '#ccc'
  };

  return (	//이긴 칸의 배경색을 winningSquareStyle에서 가져온다
    <button className="square" onClick={props.onClick} style={props.winningSquare ? winningSquareStyle : null}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, row, col) {
    let winningSquare = this.props.winner && this.props.winner.includes(i) ? true : false; //승리자의 사각형을 표시해주기 위해 선언한 변수
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i, row, col)}
        winningSquare = {winningSquare}
      />
    );
  }

  render() {
    
    let squares = [];
    let num = 0;
    let row = [];
    
    //이중for문으로 가로와 세로에 각각 0~2까지 값을 넣어줬다
    for(let i = 0; i < 3; i++) {
      row = [];
      for(let j = 0; j < 3; j++) {
        row.push(this.renderSquare(num, i, j)); /* i(renderSquare의 매개변수) = num, row = i, col = j. num이 없으면 한칸 클릭시 한줄이 다 채
	                                        워지고 i or j가 없으면 안넣으면 각각 undefined가 뜬다 */
        num++;  //칸하나를 선택할 때 전체 다 선택되지 않기 위해 1씩 증가시켜준다
      }
      squares.push(<div key ={num} className="board-row">{row}</div>);
    }
    return(
      <div>
        {squares}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
         xIsNext: true,
      clicked: null,  //(row,col)형식으로 바꾸기 위한 변수
      ascending: true  //오름차순 또는 내림차순으로 변경하기 위한 변수
    };
  }

  handleClick(i, row, col) {
    //.slice() 연산자를 쓴 이유는 squares 배열을 복사해 기본 배열과 새 배열을 비교하여 원할 때 변경할 수 있게 해주기 위해서이다
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
      squares[i] = this.state.xIsNext ? "X" : "O";
      
    this.setState({
      history: history.concat([
        {
               squares: squares,
               clicked: [row,col]
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  //오름차순 or 내림차순
  toggle() {
    this.setState({
      ascending: !this.state.ascending
    })
  }

  render() {
    const history = this.state.history; 
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
         
         let desc = 'Go to Game start';
         let row = null;
         let col = null;
         
         //만약 어떤 한 사각형을 선택하면 그 사각형의 움직임이 (row,col) 형식으로 뜬다
         //예를 들면 처음에 플레이어가 첫번째 줄에서 3번째 칸에 있는 사각형을 선택했다면 Go to move: #1 (0,2) 라고 뜬다
         if(move) {
            desc = 'Go to move: #' +move;
            row = '('+this.state.history[move].clicked[0]+', ';
            col = this.state.history[move].clicked[1]+')';
         }

      //move list(if문)를 bold처리해줌
      //move와 stepNumber의 값이 완전히 일치하면 bold처리를 해줌
         let bold = (move === this.state.stepNumber ? 'bold' : '');

      return (
        <li key={move}>
          <button className={bold} onClick={() => this.jumpTo(move)}>{desc} {row} {col}</button>
        </li>
      );
    });

    //오름차순 또는 내림차순 정렬
    if(!this.state.ascending) {
      moves.sort((a,b) => b.key - a.key);
    }

    let status;
    if (winner && winner !== 'draw') { //무승부가 아니라면 승자는 X 또는 O가 나옴
      status = "Winner: " + (this.state.xIsNext ? "O" : "X");
    } else if (winner && winner === 'draw'){  //무승부라면 Match is draw 출력
      status = "Match is " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i, row, col) => this.handleClick(i, row, col)}
            winner={winner && winner.winningSquares}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <button onClick = {() => this.toggle()}>Change</button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winningSquares: lines[i]};
    } else if(!squares.includes(null)) {	//사각형에 null이 없으면 9칸이 다찬것이므로 무승부
      return 'draw';
    }
  }
  return null;
}
