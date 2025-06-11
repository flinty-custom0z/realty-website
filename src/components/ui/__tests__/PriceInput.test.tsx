import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PriceInput from '../PriceInput';

describe('PriceInput', () => {
  it('renders correctly with required props', () => {
    const handleChange = jest.fn();
    render(
      <PriceInput
        id="test-price"
        name="price"
        value="1000000"
        onChange={handleChange}
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('1 000 000');
  });
  
  it('renders with label and suffix', () => {
    render(
      <PriceInput
        id="test-price"
        name="price"
        value="2500000"
        onChange={jest.fn()}
        label="Price"
        suffix="₽"
        required
      />
    );
    
    expect(screen.getByText('Price (₽) *')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('2 500 000');
  });
  
  it('handles user input correctly', () => {
    const handleChange = jest.fn();
    render(
      <PriceInput
        id="test-price"
        name="price"
        value=""
        onChange={handleChange}
      />
    );
    
    const input = screen.getByRole('textbox');
    
    // Type a number with spaces
    fireEvent.change(input, { target: { value: '3 500 000' } });
    expect(handleChange).toHaveBeenCalledWith('price', '3500000');
    
    // Type a number without spaces
    fireEvent.change(input, { target: { value: '4500000' } });
    expect(handleChange).toHaveBeenCalledWith('price', '4500000');
    
    // Type non-numeric characters
    fireEvent.change(input, { target: { value: '5abc,500.000' } });
    expect(handleChange).toHaveBeenCalledWith('price', '5500000');
  });
  
  it('formats the value correctly', () => {
    const { rerender } = render(
      <PriceInput
        id="test-price"
        name="price"
        value="1234567"
        onChange={jest.fn()}
      />
    );
    
    expect(screen.getByRole('textbox')).toHaveValue('1 234 567');
    
    // Test with different value
    rerender(
      <PriceInput
        id="test-price"
        name="price"
        value="9876543210"
        onChange={jest.fn()}
      />
    );
    
    expect(screen.getByRole('textbox')).toHaveValue('9 876 543 210');
    
    // Test with empty value
    rerender(
      <PriceInput
        id="test-price"
        name="price"
        value=""
        onChange={jest.fn()}
      />
    );
    
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
}); 