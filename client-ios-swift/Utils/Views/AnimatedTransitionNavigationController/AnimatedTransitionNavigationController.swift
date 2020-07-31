/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class AnimatedTransitionNavigationController:
    UINavigationController,
    UINavigationControllerDelegate
{
    init() {
        super.init(rootViewController: UIViewController())
        sharedInit()
    }
    
    override init(rootViewController: UIViewController) {
        super.init(rootViewController: rootViewController)
        sharedInit()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        sharedInit()
    }
    
    private func sharedInit() {
        modalPresentationStyle = .fullScreen
        modalTransitionStyle = .crossDissolve
        setNavigationBarHidden(true, animated: false)
        delegate = self
    }
    
    // MARK: - UINavigationControllerDelegate -
    func navigationController(_ navigationController: UINavigationController,
                              animationControllerFor operation: UINavigationController.Operation,
                              from fromVC: UIViewController,
                              to toVC: UIViewController) -> UIViewControllerAnimatedTransitioning? {
        AnimatedTransition()
    }
}
