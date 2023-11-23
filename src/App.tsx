import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Container, TextField, Button, Box, Card, CardContent, Typography, Grid } from '@mui/material';
import axios from 'axios';

function formatPubDate(pubDate) {
  if (pubDate.length === 8) {
    // YYYYMMDD 形式
    return `${pubDate.substring(0, 4)}-${pubDate.substring(4, 6)}-${pubDate.substring(6)}`;
  } else if (pubDate.length === 6) {
    // YYYYMM 形式
    return `${pubDate.substring(0, 4)}-${pubDate.substring(4)}`;
  } else {
    // 予期しない形式の場合、そのまま返す
    return pubDate;
  }
}

function validateIsbnList(isbnList) {
  const invalidIsbns = [];
  const validIsbns = [];

  isbnList.forEach((isbn, index) => {
    // ISBNの基本的なバリデーション: 長さが10または13であり、数字のみで構成される
    if (/^\d{10}(\d{3})?$/.test(isbn)) {
      validIsbns.push(isbn);
    } else {
      invalidIsbns.push({ index, isbn });
    }
  });

  return { validIsbns, invalidIsbns };
}




const App = () => {
  const [isbnInput, setIsbnInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearchResults([]); // 検索結果をリセット

    try {
      const isbnList = isbnInput.split(/,|\n/).map(isbn => isbn.trim());
      const { validIsbns, invalidIsbns } = validateIsbnList(isbnList);

      if (invalidIsbns.length) {
        // 不正なISBNがある場合はエラーメッセージを表示
        alert(`上から${invalidIsbns.map(i => i.index + 1).join(', ')}番目のISBNが不正です`);
      }

      if (validIsbns.length) {
        axios.get(`https://api.openbd.jp/v1/get?isbn=${validIsbns.join(',')}`)
          .then((response) => {
            setSearchResults(response.data);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };


  const SearchResult = ({ result }) => {
    if (!result) {
      return null;
    }
    return (
      <Card sx={{ minWidth: 275, margin: 2 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            {result.summary.title}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {result.summary.isbn}
          </Typography>
          <Typography variant="body2">
            出版社: {result.summary.publisher}
            <br />
            発行日: {formatPubDate(result.summary.pubdate)}
            <br />
            著者: {result.summary.author}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Container maxWidth="md">
        <Box sx={{ flexGrow: 1, padding: 3 }}>
          <Grid item xs={12}>
            <Typography variant="h3" component="div" gutterBottom>
              ISBN Search
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="ISBN"
              multiline
              rows={10}
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              fullWidth
              margin="normal"

            />
            <Button variant="contained" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
          <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center">
            <Grid item xs={12}>
              {searchResults.map((result, index) => (
                <SearchResult key={index} result={result} />
              ))}
            </Grid>
          </Grid>
        </Box>
      </Container>
    </BrowserRouter>
  );
};

export default App;
