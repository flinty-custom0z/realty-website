import { render, screen, fireEvent } from '@testing-library/react';
import { PriceRangeFilter } from '../PriceRangeFilter';

// Mock react-range
jest.mock('react-range', () => ({
  Range: ({ values, onChange, renderTrack, renderThumb }: any) => {
    const handleChange = (e: any) => {
      // Simulate range slider changes
      const newValues = [
        parseInt(e.target.getAttribute('data-test-min')),
        parseInt(e.target.getAttribute('data-test-max'))
      ];
      onChange(newValues);
    };

    return (
      <div>
        {renderTrack({
          props: { style: {} },
          children: (
            <button
              data-testid="range-slider"
              data-test-min="500000"
              data-test-max="2000000"
              onClick={handleChange}
            >
              Range Track
            </button>
          )
        })}
        {renderThumb({ props: { key: 'min', style: {} } })}
        {renderThumb({ props: { key: 'max', style: {} } })}
      </div>
    );
  }
}));

describe('PriceRangeFilter', () => {
  it('renders correctly with min and max values', () => {
    render(
      <PriceRangeFilter
        min={100000}
        max={5000000}
        currentMin={500000}
        currentMax={2000000}
        onChange={jest.fn()}
      />
    );
    
    // Check that the component renders the title
    expect(screen.getByText('Цена, ₽')).toBeInTheDocument();
    
    // Check input fields have correct formatted values
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('500 000');
    expect(inputs[1]).toHaveValue('2 000 000');
    
    // Check min/max labels are displayed
    expect(screen.getByText('100 000 ₽')).toBeInTheDocument();
    expect(screen.getByText('5 000 000 ₽')).toBeInTheDocument();
  });
  
  it('calls onChange when range slider changes', () => {
    const handleChange = jest.fn();
    
    render(
      <PriceRangeFilter
        min={100000}
        max={5000000}
        currentMin={300000}
        currentMax={1500000}
        onChange={handleChange}
      />
    );
    
    // Simulate slider change
    fireEvent.click(screen.getByTestId('range-slider'));
    
    // Verify onChange was called with correct values
    expect(handleChange).toHaveBeenCalledWith(500000, 2000000);
  });
  
  it('calls onInputChange when input values change', () => {
    const handleInputChange = jest.fn();
    
    render(
      <PriceRangeFilter
        min={100000}
        max={5000000}
        currentMin={300000}
        currentMax={1500000}
        onChange={jest.fn()}
        onInputChange={handleInputChange}
      />
    );
    
    const inputs = screen.getAllByRole('textbox');
    
    // Change min price input
    fireEvent.change(inputs[0], { target: { value: '400000' } });
    expect(handleInputChange).toHaveBeenCalledWith('min', '400000');
    
    // Change max price input
    fireEvent.change(inputs[1], { target: { value: '2500000' } });
    expect(handleInputChange).toHaveBeenCalledWith('max', '2500000');
  });
  
  it('shows loading state and hides slider when isLoading is true', () => {
    render(
      <PriceRangeFilter
        min={100000}
        max={5000000}
        currentMin={500000}
        currentMax={2000000}
        onChange={jest.fn()}
        isLoading={true}
      />
    );
    
    // Range slider should not be rendered when loading
    expect(screen.queryByTestId('range-slider')).not.toBeInTheDocument();
  });
}); 