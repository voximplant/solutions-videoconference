/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class AlertHelper {
    static private var closeAction: UIAlertAction {
        UIAlertAction(
            title: "Close",
            style: .cancel
        )
    }
    
    static private var accessSettingsAction: UIAlertAction {
        UIAlertAction(
            title: "Open settings",
            style: .default
        ) { _ in
            let settings = URL(string: UIApplication.openSettingsURLString)!
            if #available(iOS 10.0, *) { UIApplication.shared.open(settings) }
            else { UIApplication.shared.openURL(settings) }
        }
    }
    
    static func showActionSheet(
        actions: [UIAlertAction],
        sourceView: UIView,
        on viewController: UIViewController
    ) {
        DispatchQueue.main.async {
            let alertController = UIAlertController(
                title: nil,
                message: nil,
                preferredStyle: .actionSheet
            )
            actions.forEach { action in
                alertController.addAction(action)
            }
            alertController.addAction(closeAction)
            alertController.popoverPresentationController?.sourceView = sourceView
            viewController.present(alertController, animated: true)
        }
    }
    
    static func showError(
        message: String,
        action: UIAlertAction? = nil,
        on viewController: UIViewController
    ) {
        DispatchQueue.main.async {
            let alertController = UIAlertController(
                title: "Something went wrong",
                message: message,
                preferredStyle: .alert
            )
            if let action = action {
                alertController.addAction(action)
            }
            alertController.addAction(closeAction)
            viewController.present(alertController, animated: true)
        }
    }
    
    static func showErrorWithSettingsAction(
        title: String = "Something went wrong",
        message: String,
        on viewController: UIViewController
    ) {
        showError(message: title, action: accessSettingsAction, on: viewController)
    }
    
    static func showAlert(
        title: String,
        message: String,
        actions: [UIAlertAction],
        defaultAction: Bool = false,
        on viewController: UIViewController
    ) {
        DispatchQueue.main.async {
            let alertController = UIAlertController(
                title: title,
                message: message,
                preferredStyle: .alert
            )
            actions.forEach { action in
                alertController.addAction(action)
            }
            if defaultAction {
                alertController.addAction(closeAction)
            }
            viewController.present(alertController, animated: true)
        }
    }
}
