import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import homeStore from '../homeStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const { coins, trending, query, setQuery, fetchCoins, loading, error, graphs } = homeStore(state => ({
    coins: state.coins.slice(0, 6),
    trending: state.trending,
    query: state.query,
    setQuery: state.setQuery,
    fetchCoins: state.fetchCoins,
    loading: state.loading,
    error: state.error,
    graphs: state.graphs,
  }));

  const [priceChanges, setPriceChanges] = useState({});

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  useEffect(() => {
    const updatedChanges = {};
    coins.forEach(coin => {
      if (graphs[coin.id] && graphs[coin.id].length >= 2) {
        const currentPrice = graphs[coin.id][graphs[coin.id].length - 1].price;
        const previousPrice = graphs[coin.id][graphs[coin.id].length - 2].price;
        if (currentPrice > previousPrice) {
          updatedChanges[coin.id] = 'up';
        } else if (currentPrice < previousPrice) {
          updatedChanges[coin.id] = 'down';
        } else {
          updatedChanges[coin.id] = null;
        }
      } else {
        updatedChanges[coin.id] = null;
      }
    });
    setPriceChanges(updatedChanges);
  }, [coins, graphs]);

  const handlePriceChangeIndicator = (coinId) => {
    if (priceChanges[coinId] === 'up') {
      return <span className="text-green-500">▲</span>;
    } else if (priceChanges[coinId] === 'down') {
      return <span className="text-red-500">▼</span>;
    }
    return null;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-black text-white py-4 px-8 flex justify-between items-center w-full">
        <Link to="/" className="text-xl font-bold">
          CryptoX
        </Link>
        <div className="w-full mb-4 flex justify-center">
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            className="p-2 border border-gray-300 rounded w-64 text-black"
            placeholder="Search for a coin"
          />
        </div>
      </header>

      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        
        {/* Big graph for the last 121 days */}
        <div className="w-full mb-12">
          <h2 className="text-2xl font-semibold mb-4">Market Overview (Last 121 Days)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={graphs[coins[0].id]} // Assuming coins[0] has the data, you can adjust this as needed
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 flex-wrap mt-20 mb-6">
          {coins.map(coin => (
            <div key={coin.id} className="bg-white p-4 rounded shadow-md text-center w-52">
              <Link to={`/${coin.id}`} className="block">
                <img src={coin.image} alt={coin.name} className="mx-auto mb-2 w-12 h-12 object-contain" />
                <span className="text-sm text-blue-500 hover:underline">{coin.name}</span>
                <div className="flex items-center justify-center mt-1">
                  {handlePriceChangeIndicator(coin.id)}
                  <div className="text-gray-700 ml-1">Price: {coin.priceBtc} BTC</div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <hr className="border-b-2 border-black my-8 w-3/4" />

        <div>
          <h2 className="text-2xl font-semibold mb-4">Trending Coins</h2>
          <ul className="divide-y divide-gray-200">
            {trending.slice(0, 10).map(coin => (
              <li key={coin.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <Link to={`/${coin.id}`} className="flex items-center space-x-2">
                    <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="text-lg text-blue-500 hover:underline">{coin.name}</div>
                  </Link>
                  <div className="text-gray-700 flex flex-col">
                    <span>
                      {handlePriceChangeIndicator(coin.id)}
                      Price: {coin.priceBtc} BTC
                    </span>
                    {graphs[coin.id] && (
                      <ResponsiveContainer width={150} height={100}>
                        <LineChart data={graphs[coin.id]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" hide />
                          <YAxis hide />
                          <Tooltip />
                          <Line type="monotone" dataKey="price" stroke="#8884d8" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
