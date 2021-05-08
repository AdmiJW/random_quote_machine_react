import React from 'react';

import QuoteDiv from './QuoteDiv';
import LogoDiv from './LogoDiv';

class QuoteWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            quoteHistory: [],           //History of shown quotes, size 10
            currentQuote: {},           //Quote currently showing
            fetching: false             //Shows a loading spinner when true
        }

        this.prevQuote = this.prevQuote.bind(this);
        this.nextQuote = this.nextQuote.bind(this);
        this.fetchQuote = this.fetchQuote.bind(this);
        this.quoteFetched = this.quoteFetched.bind(this);

        this.limitHistory = 10;     //Set this to limit how many past quotes to be stored
    }

    //When mounted, component immediately get nextQuote
    componentDidMount() {
        this.nextQuote();
    }


    //Called as callback when the quote is fetched from the quote API
    quoteFetched(quote) {
        //Fetched the same quote again. Refetch to get a different one
        if (this.state.currentQuote.quoteAuthor === quote.author ) {
            this.fetchQuote();
        }
        else {
            this.setState(state => ({

                // Has to check if the current quote is empty or not. Without this code, the app when launched, will
                // add an empty object to the quoteHistory
                quoteHistory: (state.currentQuote.hasOwnProperty("quoteAuthor")? 
                    //Check if the quoteHistory contains over 10 items? If yes, then discard the first one.
                    (state.quoteHistory.length >= this.limitHistory)?
                        [ ...state.quoteHistory.slice(1, this.limitHistory), state.currentQuote ]:
                        [...state.quoteHistory, state.currentQuote]: 
                    //End of checking if quoteHistory over 10 items
                state.quoteHistory),        //No quoteAuthor in currentQuote. Don't add to quote History

                currentQuote: {
                    quoteText: quote.content,
                    quoteAuthor: quote.author
                },
                fetching: false
            }) );
        }
    }

    fetchQuote() {
        const target = 'http://api.quotable.io/random';

        this.setState( {fetching: true} );
    
        fetch(target)
        .then(e => e.json() )
        .then(e => this.quoteFetched(e) )
        .catch( err => {                        //Both the proxy fails. Show an error message
            this.setState({
                currentQuote: { quoteText: 'Unable to fetch quote! ' + err.message },
                fetching: false
            });
        });
    }

    prevQuote() {
        //Set the last element of the quoteHistory as current Quote, and remove it from the quoteHistory
        this.setState(state => {
            const len = state.quoteHistory.length;
            return {
                quoteHistory: state.quoteHistory.slice(0, len - 1),
                currentQuote: state.quoteHistory[len - 1]
            };
        });
        this.props.changeBg();
    }

    nextQuote() {
        this.fetchQuote();
        this.props.changeBg();
    }

    render() {
        const { fetching } = this.state;
        return (
            <div className='quote' id='quote-box'>
                <button type='button' className='arrow-btn' id='prev-quote' onClick={this.prevQuote} disabled={this.state.quoteHistory.length === 0} tabIndex='0'>
                    <i className="fas fa-caret-left"></i>
                </button>
                <div className='quote-mid'>
                    <i className="fas fa-spinner" style={ 
                         fetching? { opacity: 1}: {opacity: 0}
                         } >
                    </i>
                    <QuoteDiv quote={this.state.currentQuote} fetching={fetching} />
                    <LogoDiv quote={this.state.currentQuote}/>
                </div>
                <button type='button' className='arrow-btn' id='new-quote' onClick={this.nextQuote} tabIndex='0'>
                    <i className="fas fa-caret-right"></i>
                </button>
            </div>
        );
    }

}

export default QuoteWrapper;