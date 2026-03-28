import { ethers, Contract } from 'ethers';

// Contract ABI (abbreviated)
export const WORLD_CUP_BETTING_ABI = [
  'function placeBet(uint256 _matchId, string memory _selectedTeam, uint256 _odds) external payable',
  'function createMatch(string memory _teamA, string memory _teamB) external',
  'function updateMatchScore(uint256 _matchId, uint8 _scoreA, uint8 _scoreB) external',
  'function finalizeMatch(uint256 _matchId, address _winnerId) external',
  'function cancelBet(uint256 _betId) external',
  'function withdrawCommission() external',
  'function getBookmakerStats() external view returns (tuple(uint256 totalBetsReceived, uint256 totalPayouts, uint256 totalCommission, int256 netProfit))',
  'function getUserBets(address _user) external view returns (uint256[])',
  'function getBetDetails(uint256 _betId) external view returns (tuple(uint256 id, address bettor, uint256 matchId, string selectedTeam, uint256 amount, uint256 odds, uint8 status, uint256 payout))',
  'function getContractBalance() external view returns (uint256)',
  'event BetPlaced(uint256 indexed betId, address indexed bettor, uint256 indexed matchId, string selectedTeam, uint256 amount, uint256 odds)',
  'event BetSettled(uint256 indexed betId, bool won, uint256 payout)',
  'event BetCancelled(uint256 indexed betId)',
];

export class WorldCupBettingContract {
  private contract: Contract;

  constructor(contractAddress: string, providerOrSigner?: any) {
    const provider = providerOrSigner || new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet-rpc.monad.xyz'
    );
    this.contract = new ethers.Contract(contractAddress, WORLD_CUP_BETTING_ABI, provider);
  }

  // Cancel bet
  async cancelBet(betId: string) {
    try {
      const tx = await this.contract.cancelBet(betId);
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        message: '✅ Bahis iptal edildi ve para geri ödendi!',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get contract balance
  async getContractBalance() {
    try {
      const balance = await this.contract.getContractBalance();
      return ethers.formatEther(balance);
    } catch (error: any) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }
}

// Export singleton instance
export function getContractInstance(
  contractAddress: string = process.env.NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS || ''
) {
  if (!contractAddress) {
    throw new Error('Betting contract address not configured');
  }

  return new WorldCupBettingContract(
    contractAddress,
    process.env.NEXT_PUBLIC_RPC_URL
  );
}
