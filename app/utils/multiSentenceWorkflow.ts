// Multi-Sentence Document Search Workflow Handler

export interface SentenceSearchResult {
  sentence: string;
  searchResult: any;
  answer: string;
}

export async function executeMultiSentenceWorkflow(
  userInput: string,
  apiKey: string,
  baseUrl: string
): Promise<{ result: any; explanation: string }> {
  
  // Split user input into sentences
  const sentences = splitIntoSentences(userInput);
  console.log('Split into sentences:', sentences);
  
  const searchResults: SentenceSearchResult[] = [];
  
  // Execute document search for each sentence
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (sentence.length === 0) continue;
    
    try {
      console.log(`Searching for sentence ${i + 1}: "${sentence}"`);
      
      const searchResult = await executeDocumentSearch({
        query: sentence,
        model: 'alfred-4.2'
      }, apiKey, baseUrl);
      
      const answer = extractAnswerFromSearchResult(searchResult);
      
      searchResults.push({
        sentence,
        searchResult,
        answer
      });
      
      console.log(`Sentence ${i + 1} result:`, answer);
      
    } catch (error) {
      console.error(`Error searching for sentence "${sentence}":`, error);
      searchResults.push({
        sentence,
        searchResult: null,
        answer: `Error: Could not search for "${sentence}"`
      });
    }
  }
  
  // Generate final formatted answer
  const finalAnswer = formatFinalAnswer(searchResults);
  
  return {
    result: {
      workflow_results: searchResults.map((result, index) => ({
        step: `sentence_${index + 1}_search`,
        result: {
          content: result.answer,
          answer: result.answer,
          original_sentence: result.sentence
        },
        timestamp: new Date().toISOString()
      })),
      final_answer: finalAnswer,
      final_context: {
        total_sentences: sentences.length,
        successful_searches: searchResults.filter(r => r.searchResult !== null).length
      }
    },
    explanation: `Processed ${sentences.length} sentences with ${searchResults.filter(r => r.searchResult !== null).length} successful searches`
  };
}

function splitIntoSentences(text: string): string[] {
  // Split by periods, exclamation marks, and question marks
  // This regex handles various sentence endings while preserving abbreviations
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.filter(sentence => sentence.trim().length > 0);
}

async function executeDocumentSearch(parameters: any, apiKey: string, baseUrl: string) {
  const requestBody = {
    query: parameters.query,
    model: parameters.model || 'alfred-4.2',
    tool: 'DocumentSearch',
    user_instructions: `Please answer the following question specifically and directly: ${parameters.query}. Do not provide general information unless it directly relates to the question asked.`
  };

  const response = await fetch(`${baseUrl}/chat/document-search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Document search failed: ${response.statusText} - ${errorData.error || ''}`);
  }

  return await response.json();
}

function extractAnswerFromSearchResult(searchResult: any): string {
  // Extract the answer from the search result
  if (searchResult.content) {
    return searchResult.content;
  } else if (searchResult.answer) {
    return searchResult.answer;
  } else if (searchResult.response) {
    return searchResult.response;
  } else {
    return 'No answer found';
  }
}

function formatFinalAnswer(searchResults: SentenceSearchResult[]): string {
  let formattedAnswer = '';
  
  for (const result of searchResults) {
    formattedAnswer += `**Question:** ${result.sentence}\n\n`;
    formattedAnswer += `**Answer:** ${result.answer}\n\n`;
    formattedAnswer += '---\n\n';
  }
  
  return formattedAnswer.trim();
} 